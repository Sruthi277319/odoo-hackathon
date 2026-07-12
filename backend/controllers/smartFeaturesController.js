import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Maintenance from '../models/Maintenance.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';

// Get overall smart dashboard summary
export const getSmartDashboard = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const drivers = await Driver.find();
    const activeMaintenance = await Maintenance.countDocuments({ status: 'In Progress' });

    // 1. Calculate Fleet Health Score
    // Formula: Average of vehicle health scores, weighted down by number of active maintenances or critical warnings
    const totalHealth = vehicles.reduce((sum, v) => sum + v.healthScore, 0);
    const baseHealth = vehicles.length > 0 ? totalHealth / vehicles.length : 100;
    
    // Penalty for critical issues
    const criticalVehiclesCount = vehicles.filter(v => v.healthScore < 70).length;
    const healthPenalty = (criticalVehiclesCount * 3) + (activeMaintenance * 1);
    const fleetHealthScore = Math.max(0, Math.round(baseHealth - healthPenalty));

    // 2. Risk Alerts
    const alerts = [];
    
    // Check for low health vehicles
    vehicles.forEach((v) => {
      if (v.healthScore < 70) {
        alerts.push({
          type: 'CRITICAL_HEALTH',
          severity: v.healthScore < 50 ? 'High' : 'Medium',
          target: `${v.make} ${v.model} (${v.licensePlate})`,
          message: `Vehicle health score has dropped to ${v.healthScore}%. Scheduled service is advised.`,
          vehicleId: v._id,
        });
      }
    });

    // Check for expiring driver licenses (within 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    drivers.forEach((d) => {
      const expiry = new Date(d.licenseExpiryDate);
      if (expiry <= today) {
        alerts.push({
          type: 'EXPIRED_LICENSE',
          severity: 'High',
          target: d.name,
          message: `Driver license expired on ${expiry.toLocaleDateString()}. Driver should be suspended.`,
          driverId: d._id,
        });
      } else if (expiry <= thirtyDaysFromNow) {
        const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        alerts.push({
          type: 'LICENSE_EXPIRING',
          severity: daysRemaining < 7 ? 'High' : 'Medium',
          target: d.name,
          message: `Driver license expires in ${daysRemaining} days (on ${expiry.toLocaleDateString()}).`,
          driverId: d._id,
        });
      }
    });

    // 3. Maintenance Predictions
    // Predictive rules:
    // - Odometer is within 1000km of next expected maintenance
    // - Last maintenance was over 90 days ago
    // - Health score is less than 80
    const predictions = vehicles.map((v) => {
      let maintenanceNeeded = false;
      let reasons = [];
      let urgency = 'Low';

      // Mock calculation for miles since last maintenance
      // If odometer is high or health is low
      if (v.healthScore < 80) {
        maintenanceNeeded = true;
        reasons.push(`Low health score (${v.healthScore}%)`);
        urgency = v.healthScore < 60 ? 'High' : 'Medium';
      }

      const lastService = v.lastMaintenanceDate ? new Date(v.lastMaintenanceDate) : null;
      if (lastService) {
        const daysSinceService = Math.ceil((today - lastService) / (1000 * 60 * 60 * 24));
        if (daysSinceService > 90) {
          maintenanceNeeded = true;
          reasons.push(`Time since last maintenance: ${daysSinceService} days (Threshold: 90 days)`);
          if (urgency !== 'High') urgency = 'Medium';
        }
      } else {
        // No maintenance recorded
        maintenanceNeeded = true;
        reasons.push('No maintenance history recorded');
        urgency = 'Medium';
      }

      // Check next expected date
      if (v.nextMaintenanceDate) {
        const nextDate = new Date(v.nextMaintenanceDate);
        if (nextDate <= today) {
          maintenanceNeeded = true;
          reasons.push(`Missed scheduled maintenance date of ${nextDate.toLocaleDateString()}`);
          urgency = 'High';
        } else if (nextDate <= thirtyDaysFromNow) {
          maintenanceNeeded = true;
          reasons.push(`Upcoming scheduled maintenance on ${nextDate.toLocaleDateString()}`);
        }
      }

      return {
        vehicleId: v._id,
        vehicleName: `${v.make} ${v.model}`,
        licensePlate: v.licensePlate,
        status: v.status,
        maintenanceNeeded,
        reasons,
        urgency,
        predictedOdometerService: Math.round(v.odometer + 2500), // predictive estimation
      };
    }).filter(p => p.maintenanceNeeded);

    res.status(200).json({
      fleetHealthScore,
      alerts,
      predictions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving smart dashboard', error: error.message });
  }
};

// Recommends the best vehicle for a route/trip based on health score, fuel efficiency, status
export const recommendVehicle = async (req, res) => {
  try {
    const { type, requiredFuelType } = req.query;
    
    let query = { status: 'Available' };
    if (type) query.type = type;
    if (requiredFuelType) query.fuelType = requiredFuelType;

    const availableVehicles = await Vehicle.find(query);

    if (availableVehicles.length === 0) {
      return res.status(404).json({ message: 'No available vehicles matching requirements' });
    }

    // Get fuel logs to calculate efficiency
    const fuelLogs = await FuelLog.aggregate([
      { $group: { _id: '$vehicle', avgEfficiency: { $avg: { $divide: ['$distance', '$fuelAmount'] } } } }
    ]);

    const scoredVehicles = availableVehicles.map((v) => {
      const efficiencyLog = fuelLogs.find(f => f._id.toString() === v._id.toString());
      const efficiency = efficiencyLog ? efficiencyLog.avgEfficiency : 10; // default 10km/L

      // Scored formula: 60% healthScore + 40% efficiency score normalized (efficiency * 5)
      const efficiencyScore = Math.min(100, efficiency * 8);
      const compositeScore = Math.round((v.healthScore * 0.6) + (efficiencyScore * 0.4));

      return {
        vehicle: v,
        efficiency: Math.round(efficiency * 100) / 100,
        compositeScore,
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);

    res.status(200).json(scoredVehicles);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating recommendations', error: error.message });
  }
};

// Compile the visual chronological timeline of a specific vehicle
export const getVehicleTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const maintenances = await Maintenance.find({ vehicle: id });
    const fuelLogs = await FuelLog.find({ vehicle: id });
    const expenses = await Expense.find({ vehicle: id, category: { $in: ['Toll', 'Other'] } });

    const timelineEvents = [];

    // Add Vehicle creation
    timelineEvents.push({
      date: vehicle.createdAt,
      type: 'CREATION',
      title: 'Vehicle Enrolled',
      description: `Enrolled in fleet with license plate ${vehicle.licensePlate}. Starting odometer: ${vehicle.odometer} km.`,
      icon: 'check',
    });

    // Add maintenances
    maintenances.forEach((m) => {
      timelineEvents.push({
        date: m.startDate,
        type: 'MAINTENANCE_START',
        title: `Service Initiated (${m.type})`,
        description: `Scheduled description: "${m.description}". Priority: ${m.priority}.`,
        icon: 'wrench',
      });

      if (m.status === 'Completed' && m.endDate) {
        timelineEvents.push({
          date: m.endDate,
          type: 'MAINTENANCE_END',
          title: `Service Completed (${m.type})`,
          description: `Completed with cost of $${m.cost}. Notes: "${m.notes || 'None'}"`,
          icon: 'check-circle',
        });
      }
    });

    // Add fuel logs
    fuelLogs.forEach((f) => {
      timelineEvents.push({
        date: f.date,
        type: 'FUEL_LOG',
        title: 'Fuel Refill',
        description: `Refilled ${f.fuelAmount} liters costing $${f.cost}. Traveled ${f.distance} km. Odometer: ${f.odometer} km.`,
        icon: 'fuel',
      });
    });

    // Add other expenses
    expenses.forEach((e) => {
      timelineEvents.push({
        date: e.date,
        type: 'EXPENSE',
        title: `${e.category} Expense Recorded`,
        description: `${e.description} costing $${e.amount}.`,
        icon: 'dollar',
      });
    });

    // Sort events by date descending
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      vehicle,
      events: timelineEvents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error compiling vehicle timeline', error: error.message });
  }
};

// Send license renewal email reminder (Mock function)
export const sendLicenseReminder = async (req, res) => {
  try {
    const { driverId } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Mock Send Email action log
    console.log(`[EMAIL SEND] Sending license renewal notification to ${driver.name} at ${driver.email}`);
    console.log(`[EMAIL CONTENT] Dear ${driver.name}, your driver license (${driver.licenseNumber}) is expiring on ${new Date(driver.licenseExpiryDate).toLocaleDateString()}. Please update it immediately to avoid operational blockages.`);

    res.status(200).json({
      success: true,
      message: `Mock email reminder successfully logged and sent to ${driver.email}.`,
      sentTo: driver.email,
      sentAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error triggering license renewal reminder', error: error.message });
  }
};

import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';
import Expense from '../models/Expense.js';

// Get all maintenance logs
export const getMaintenances = async (req, res) => {
  try {
    const { vehicle, status, priority } = req.query;
    let query = {};
    if (vehicle) query.vehicle = vehicle;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const maintenances = await Maintenance.find(query)
      .populate('vehicle')
      .sort({ createdAt: -1 });
    res.status(200).json(maintenances);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving maintenance logs', error: error.message });
  }
};

// Create a new maintenance record
export const createMaintenance = async (req, res) => {
  try {
    const { vehicleId, description, type, cost, status, startDate, priority, notes } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const maintenance = new Maintenance({
      vehicle: vehicleId,
      description,
      type,
      cost: cost || 0,
      status: status || 'Scheduled',
      startDate: startDate || new Date(),
      priority: priority || 'Medium',
      notes,
    });

    await maintenance.save();

    // Automatically update vehicle status if status is "In Progress" or "Scheduled"
    // Requirement: Create Maintenance -> Vehicle status automatically changes from Available to In Shop
    if (maintenance.status === 'In Progress' || maintenance.status === 'Scheduled') {
      vehicle.status = 'In Shop';
      await vehicle.save();
    }

    const populatedMaintenance = await maintenance.populate('vehicle');
    res.status(201).json(populatedMaintenance);
  } catch (error) {
    res.status(400).json({ message: 'Error creating maintenance record', error: error.message });
  }
};

// Update a maintenance record
export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, type, cost, status, startDate, endDate, priority, notes } = req.body;

    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    maintenance.description = description !== undefined ? description : maintenance.description;
    maintenance.type = type !== undefined ? type : maintenance.type;
    maintenance.cost = cost !== undefined ? cost : maintenance.cost;
    maintenance.startDate = startDate !== undefined ? startDate : maintenance.startDate;
    maintenance.priority = priority !== undefined ? priority : maintenance.priority;
    maintenance.notes = notes !== undefined ? notes : maintenance.notes;

    const oldStatus = maintenance.status;
    if (status !== undefined) {
      maintenance.status = status;
    }

    if (maintenance.status === 'Completed') {
      maintenance.endDate = endDate || new Date();
    }

    await maintenance.save();

    // If transitioned to In Progress, make sure vehicle status is In Shop
    if (maintenance.status === 'In Progress' && oldStatus !== 'In Progress') {
      await Vehicle.findByIdAndUpdate(maintenance.vehicle, { status: 'In Shop' });
    }

    // If transitioned to Completed, close maintenance
    if (maintenance.status === 'Completed' && oldStatus !== 'Completed') {
      const vehicle = await Vehicle.findById(maintenance.vehicle);
      if (vehicle) {
        vehicle.status = 'Available';
        vehicle.lastMaintenanceDate = maintenance.endDate;
        // Project next maintenance in 3 months
        const nextDate = new Date(maintenance.endDate);
        nextDate.setMonth(nextDate.getMonth() + 3);
        vehicle.nextMaintenanceDate = nextDate;
        // Bump vehicle health score by 15 (max 100)
        vehicle.healthScore = Math.min(100, vehicle.healthScore + 15);
        await vehicle.save();
      }

      // Automatically log the expense
      const expense = new Expense({
        category: 'Maintenance',
        amount: maintenance.cost,
        date: maintenance.endDate || new Date(),
        vehicle: maintenance.vehicle,
        description: `Maintenance: ${maintenance.description} (${maintenance.type})`,
        referenceId: maintenance._id,
      });
      await expense.save();
    }

    const populated = await maintenance.populate('vehicle');
    res.status(200).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating maintenance record', error: error.message });
  }
};

// Close maintenance specifically (quick action)
export const closeMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { cost, notes } = req.body;

    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    if (maintenance.status === 'Completed') {
      return res.status(400).json({ message: 'Maintenance is already completed' });
    }

    maintenance.status = 'Completed';
    maintenance.endDate = new Date();
    if (cost !== undefined) {
      maintenance.cost = cost;
    }
    if (notes !== undefined) {
      maintenance.notes = notes;
    }

    await maintenance.save();

    // Automatically set vehicle back to Available
    const vehicle = await Vehicle.findById(maintenance.vehicle);
    if (vehicle) {
      vehicle.status = 'Available';
      vehicle.lastMaintenanceDate = maintenance.endDate;
      const nextDate = new Date(maintenance.endDate);
      nextDate.setMonth(nextDate.getMonth() + 3);
      vehicle.nextMaintenanceDate = nextDate;
      // Bump vehicle health score
      vehicle.healthScore = Math.min(100, vehicle.healthScore + 15);
      await vehicle.save();
    }

    // Automatically create maintenance expense record
    const expense = new Expense({
      category: 'Maintenance',
      amount: maintenance.cost,
      date: maintenance.endDate,
      vehicle: maintenance.vehicle,
      description: `Closed Maintenance: ${maintenance.description} (${maintenance.type})`,
      referenceId: maintenance._id,
    });
    await expense.save();

    const populated = await maintenance.populate('vehicle');
    res.status(200).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error closing maintenance record', error: error.message });
  }
};

// Get single maintenance log
export const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id).populate('vehicle');
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    res.status(200).json(maintenance);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving maintenance record', error: error.message });
  }
};

// Delete maintenance log
export const deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // If it was in progress, set the vehicle back to Available
    if (maintenance.status === 'In Progress' || maintenance.status === 'Scheduled') {
      await Vehicle.findByIdAndUpdate(maintenance.vehicle, { status: 'Available' });
    }

    await Maintenance.findByIdAndDelete(req.params.id);
    
    // Also remove associated maintenance expense
    await Expense.deleteMany({ referenceId: req.params.id });

    res.status(200).json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting maintenance record', error: error.message });
  }
};

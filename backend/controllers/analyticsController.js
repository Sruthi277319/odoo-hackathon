import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Maintenance from '../models/Maintenance.js';

// Get comprehensive analytics data
export const getAnalyticsOverview = async (req, res) => {
  try {
    // 1. Fuel Efficiency (distance / fuel amount) per vehicle
    const fuelEfficiencyData = await FuelLog.aggregate([
      {
        $group: {
          _id: '$vehicle',
          totalFuel: { $sum: '$fuelAmount' },
          totalDistance: { $sum: '$distance' },
          avgOdometer: { $max: '$odometer' },
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicleInfo',
        },
      },
      {
        $unwind: '$vehicleInfo',
      },
      {
        $project: {
          vehicleId: '$_id',
          licensePlate: '$vehicleInfo.licensePlate',
          vehicleName: { $concat: ['$vehicleInfo.make', ' ', '$vehicleInfo.model'] },
          efficiency: {
            $cond: [
              { $eq: ['$totalFuel', 0] },
              0,
              { $round: [{ $divide: ['$totalDistance', '$totalFuel'] }, 2] },
            ],
          },
          totalDistance: 1,
          totalFuel: 1,
        },
      },
      { $sort: { efficiency: -1 } },
    ]);

    // 2. Fleet Utilization
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'Available' });
    const inShopVehicles = await Vehicle.countDocuments({ status: 'In Shop' });
    const outOfServiceVehicles = await Vehicle.countDocuments({ status: 'Out of Service' });

    const utilizationRate = totalVehicles > 0 
      ? Math.round((availableVehicles / totalVehicles) * 100)
      : 0;

    const fleetUtilization = {
      totalVehicles,
      availableVehicles,
      inShopVehicles,
      outOfServiceVehicles,
      utilizationRate, // % of fleet ready for work
    };

    // 3. Operational Cost Breakdown
    const expenseBreakdown = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const categories = ['Fuel', 'Maintenance', 'Toll', 'Other'];
    const formattedBreakdown = categories.map((cat) => {
      const found = expenseBreakdown.find((item) => item._id === cat);
      return {
        name: cat,
        value: found ? found.total : 0,
      };
    });

    // 4. Operational Cost over time (Monthly expenses for the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyCosts = await Expense.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Format monthly data for charts (recharts format)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrendMap = {};

    // Initialize last 6 months in target map
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      const mLabel = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyTrendMap[mLabel] = { month: mLabel, Fuel: 0, Maintenance: 0, Toll: 0, Other: 0, Total: 0 };
    }

    monthlyCosts.forEach((item) => {
      const monthIndex = item._id.month - 1;
      const mLabel = `${monthNames[monthIndex]} ${item._id.year}`;
      if (monthlyTrendMap[mLabel]) {
        monthlyTrendMap[mLabel][item._id.category] = item.total;
        monthlyTrendMap[mLabel].Total += item.total;
      }
    });

    const monthlyTrend = Object.values(monthlyTrendMap);

    // 5. Vehicle ROI
    // Since actual trip revenue is out of scope, we mock revenue: distance * $1.80 per km
    // Expenses are loaded per vehicle.
    const vehicleCosts = await Expense.aggregate([
      {
        $match: { vehicle: { $ne: null } },
      },
      {
        $group: {
          _id: '$vehicle',
          totalExpenses: { $sum: '$amount' },
        },
      },
    ]);

    const vehicleMilage = await FuelLog.aggregate([
      {
        $group: {
          _id: '$vehicle',
          totalDistance: { $sum: '$distance' },
        },
      },
    ]);

    const allVehicles = await Vehicle.find();
    const vehicleROI = allVehicles.map((v) => {
      const costItem = vehicleCosts.find((c) => c._id.toString() === v._id.toString());
      const distanceItem = vehicleMilage.find((m) => m._id.toString() === v._id.toString());

      const expenses = costItem ? costItem.totalExpenses : 0;
      const distance = distanceItem ? distanceItem.totalDistance : v.odometer * 0.1; // fallback
      
      // Calculate mock revenue based on distance traveled: $2.20 per km
      const mockRevenue = Math.round(distance * 2.20);
      const netProfit = mockRevenue - expenses;
      const roiPercentage = expenses > 0 ? Math.round((netProfit / expenses) * 100) : 100;

      return {
        vehicleId: v._id,
        vehicleName: `${v.make} ${v.model}`,
        licensePlate: v.licensePlate,
        expenses,
        revenue: mockRevenue,
        roi: roiPercentage,
        profit: netProfit,
      };
    }).sort((a, b) => b.roi - a.roi);

    // 6. Driver Performance (Ranks from Driver schema)
    const driverPerformance = await Driver.find()
      .sort({ safetyScore: -1, rating: -1 })
      .limit(10);

    // 7. Top Vehicles: Sort by lowest maintenance cost and highest health score
    const topVehicles = allVehicles.map((v) => {
      const costItem = vehicleCosts.find((c) => c._id.toString() === v._id.toString());
      const expenses = costItem ? costItem.totalExpenses : 0;
      return {
        _id: v._id,
        name: `${v.make} ${v.model}`,
        licensePlate: v.licensePlate,
        healthScore: v.healthScore,
        expenses,
        status: v.status,
      };
    }).sort((a, b) => b.healthScore - a.healthScore || a.expenses - b.expenses).slice(0, 5);

    res.status(200).json({
      fuelEfficiency: fuelEfficiencyData,
      fleetUtilization,
      expenseBreakdown: formattedBreakdown,
      monthlyTrend,
      vehicleROI,
      driverPerformance,
      topVehicles,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error compiling analytics', error: error.message });
  }
};

import Maintenance from '../models/Maintenance.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';

// Compile reporting data for CSV Exports based on date filters
export const getExportData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    // Get expenses
    const expenseQuery = {};
    if (Object.keys(dateFilter).length > 0) expenseQuery.date = dateFilter;
    const expenses = await Expense.find(expenseQuery)
      .populate('vehicle')
      .sort({ date: 1 });

    const formattedExpenses = expenses.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Category: e.category,
      Amount: e.amount,
      Vehicle: e.vehicle ? `${e.vehicle.make} ${e.vehicle.model} (${e.vehicle.licensePlate})` : 'N/A',
      Description: e.description,
    }));

    // Get fuel logs
    const fuelQuery = {};
    if (Object.keys(dateFilter).length > 0) fuelQuery.date = dateFilter;
    const fuelLogs = await FuelLog.find(fuelQuery)
      .populate('vehicle')
      .sort({ date: 1 });

    const formattedFuel = fuelLogs.map(f => ({
      Date: new Date(f.date).toLocaleDateString(),
      Vehicle: f.vehicle ? `${f.vehicle.make} ${f.vehicle.model} (${f.vehicle.licensePlate})` : 'N/A',
      FuelAmount_Liters: f.fuelAmount,
      Cost: f.cost,
      Distance_KM: f.distance,
      Odometer_KM: f.odometer,
      FuelType: f.fuelType,
      Efficiency_KML: f.fuelAmount > 0 ? (f.distance / f.fuelAmount).toFixed(2) : 0,
    }));

    // Get maintenance logs
    const maintenanceQuery = {};
    if (Object.keys(dateFilter).length > 0) maintenanceQuery.startDate = dateFilter;
    const maintenance = await Maintenance.find(maintenanceQuery)
      .populate('vehicle')
      .sort({ startDate: 1 });

    const formattedMaintenance = maintenance.map(m => ({
      StartDate: new Date(m.startDate).toLocaleDateString(),
      EndDate: m.endDate ? new Date(m.endDate).toLocaleDateString() : 'N/A',
      Vehicle: m.vehicle ? `${m.vehicle.make} ${m.vehicle.model} (${m.vehicle.licensePlate})` : 'N/A',
      Type: m.type,
      Description: m.description,
      Cost: m.cost,
      Status: m.status,
      Priority: m.priority,
      Notes: m.notes || '',
    }));

    res.status(200).json({
      expenses: formattedExpenses,
      fuelLogs: formattedFuel,
      maintenance: formattedMaintenance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error compiling export data', error: error.message });
  }
};

// Generate summary parameters for Reports Dashboard
export const getReportsSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const matchQuery = {};
    if (Object.keys(dateFilter).length > 0) matchQuery.date = dateFilter;

    // Aggregate overall metrics inside the selected date range
    const totalSpentArr = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSpent = totalSpentArr.length > 0 ? totalSpentArr[0].total : 0;

    const categoryBreakdown = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const chartPieData = ['Fuel', 'Maintenance', 'Toll', 'Other'].map(cat => {
      const found = categoryBreakdown.find(item => item._id === cat);
      return {
        name: cat,
        value: found ? found.total : 0
      };
    });

    // Aggregate monthly costs
    const monthlyCosts = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartBarData = monthlyCosts.map(m => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      Expenses: m.total
    }));

    res.status(200).json({
      totalSpent,
      pieData: chartPieData,
      barData: chartBarData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating reports summary', error: error.message });
  }
};

import Expense from '../models/Expense.js';

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const { category, vehicle, startDate, endDate } = req.query;
    let query = {};
    if (category) query.category = category;
    if (vehicle) query.vehicle = vehicle;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('vehicle')
      .sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving expenses', error: error.message });
  }
};

// Create manual expense (Toll, Other)
export const createExpense = async (req, res) => {
  try {
    const { category, amount, date, vehicleId, description } = req.body;

    if (!['Toll', 'Other', 'Fuel', 'Maintenance'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category. Use Toll or Other for manual logging.' });
    }

    const expense = new Expense({
      category,
      amount,
      date: date || new Date(),
      vehicle: vehicleId || null,
      description,
    });

    await expense.save();
    
    if (vehicleId) {
      await expense.populate('vehicle');
    }
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Error creating expense record', error: error.message });
  }
};

// Get summary metrics of expenses
export const getExpenseSummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Reshape summary
    const formattedSummary = {
      Fuel: 0,
      Maintenance: 0,
      Toll: 0,
      Other: 0,
      Total: 0,
    };

    summary.forEach((item) => {
      if (formattedSummary[item._id] !== undefined) {
        formattedSummary[item._id] = item.totalAmount;
      }
      formattedSummary.Total += item.totalAmount;
    });

    res.status(200).json(formattedSummary);
  } catch (error) {
    res.status(500).json({ message: 'Error aggregating expenses', error: error.message });
  }
};

// Delete manual expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Expense record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense record', error: error.message });
  }
};

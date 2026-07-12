import FuelLog from '../models/FuelLog.js';
import Vehicle from '../models/Vehicle.js';
import Expense from '../models/Expense.js';

// Get all fuel logs
export const getFuelLogs = async (req, res) => {
  try {
    const { vehicle } = req.query;
    let query = {};
    if (vehicle) query.vehicle = vehicle;

    const logs = await FuelLog.find(query).populate('vehicle').sort({ date: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving fuel logs', error: error.message });
  }
};

// Create new fuel log
export const createFuelLog = async (req, res) => {
  try {
    const { vehicleId, date, fuelAmount, cost, distance, odometer, fuelType } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Odometer validation: odometer should be equal or greater than vehicle's current odometer
    if (odometer < vehicle.odometer) {
      return res.status(400).json({
        message: `New odometer reading (${odometer}) cannot be less than the current vehicle odometer (${vehicle.odometer})`,
      });
    }

    const fuelLog = new FuelLog({
      vehicle: vehicleId,
      date: date || new Date(),
      fuelAmount,
      cost,
      distance,
      odometer,
      fuelType: fuelType || vehicle.fuelType || 'Diesel',
    });

    await fuelLog.save();

    // Automatically update vehicle's odometer
    vehicle.odometer = odometer;
    // Degrade health score slightly over distance to mock maintenance requirements
    const wear = Math.floor(distance / 500); // 1 health point lost per 500 units of distance
    if (wear > 0) {
      vehicle.healthScore = Math.max(10, vehicle.healthScore - wear);
    }
    await vehicle.save();

    // Automatically log this as a Fuel expense
    const expense = new Expense({
      category: 'Fuel',
      amount: cost,
      date: date || new Date(),
      vehicle: vehicleId,
      description: `Fuel Log: Filled ${fuelAmount}L. Odometer: ${odometer}`,
      referenceId: fuelLog._id,
    });
    await expense.save();

    const populatedLog = await fuelLog.populate('vehicle');
    res.status(201).json(populatedLog);
  } catch (error) {
    res.status(400).json({ message: 'Error creating fuel log', error: error.message });
  }
};

// Delete a fuel log
export const deleteFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Fuel log not found' });
    }

    await FuelLog.findByIdAndDelete(req.params.id);

    // Also remove associated fuel expense
    await Expense.deleteMany({ referenceId: req.params.id });

    res.status(200).json({ message: 'Fuel log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting fuel log', error: error.message });
  }
};

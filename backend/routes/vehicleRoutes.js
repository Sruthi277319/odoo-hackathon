import express from 'express';
import Vehicle from '../models/Vehicle.js';

const router = express.Router();

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ make: 1, model: 1 });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving vehicles', error: error.message });
  }
});

// POST new vehicle
router.post('/', async (req, res) => {
  try {
    const { licensePlate, make, model, year, odometer, fuelCapacity, healthScore, type, fuelType } = req.body;
    const vehicle = new Vehicle({
      licensePlate,
      make,
      model,
      year,
      odometer: odometer || 0,
      fuelCapacity: fuelCapacity || 60,
      healthScore: healthScore || 100,
      type: type || 'Truck',
      fuelType: fuelType || 'Diesel',
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: 'Error creating vehicle', error: error.message });
  }
});

export default router;

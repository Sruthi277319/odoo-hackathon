import express from 'express';
import Driver from '../models/Driver.js';

const router = express.Router();

// GET all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ name: 1 });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving drivers', error: error.message });
  }
});

// POST new driver
router.post('/', async (req, res) => {
  try {
    const { name, email, licenseNumber, licenseExpiryDate, rating, safetyScore, tripsCompleted, fuelEfficiencyScore } = req.body;
    const driver = new Driver({
      name,
      email,
      licenseNumber,
      licenseExpiryDate,
      rating: rating || 5.0,
      safetyScore: safetyScore || 100,
      tripsCompleted: tripsCompleted || 0,
      fuelEfficiencyScore: fuelEfficiencyScore || 85,
    });
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ message: 'Error creating driver', error: error.message });
  }
});

export default router;

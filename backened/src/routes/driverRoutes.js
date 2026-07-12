const express = require('express');
const { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');
const { validateDriver, validateDriverUpdate } = require('../middleware/validators');

const router = express.Router();

// Apply auth protection to all routes
router.use(protect);

router.route('/')
  .get(getDrivers)
  .post(validateDriver, createDriver);

router.route('/:id')
  .get(getDriverById)
  .put(validateDriverUpdate, updateDriver)
  .delete(deleteDriver);

module.exports = router;

const express = require('express');
const { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { validateVehicle, validateVehicleUpdate } = require('../middleware/validators');

const router = express.Router();

// Apply auth protection to all routes
router.use(protect);

router.route('/')
  .get(getVehicles)
  .post(validateVehicle, createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .put(validateVehicleUpdate, updateVehicle)
  .delete(deleteVehicle);

module.exports = router;

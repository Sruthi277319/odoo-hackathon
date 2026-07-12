const express = require('express');
const { getTrips, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { validateTrip, validateTripUpdate } = require('../middleware/validators');

const router = express.Router();

// Apply auth protection to all routes
router.use(protect);

router.route('/')
  .get(getTrips)
  .post(validateTrip, createTrip);

router.route('/:id')
  .get(getTripById)
  .put(validateTripUpdate, updateTrip)
  .delete(deleteTrip);

module.exports = router;

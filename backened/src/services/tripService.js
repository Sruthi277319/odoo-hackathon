const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

/**
 * Get all trips with pagination, search, sorting and filtering
 */
const getTrips = async ({
  page = 1,
  limit = 10,
  search = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
  status = '',
}) => {
  const query = {};

  // Status Filter
  if (status) {
    query.status = status;
  }

  // Search Filter: Search by source/destination, or by vehicle name/driver name
  if (search) {
    const matchingVehicles = await Vehicle.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    const matchingDrivers = await Driver.find({ name: { $regex: search, $options: 'i' } }).select('_id');

    query.$or = [
      { source: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
      { vehicle: { $in: matchingVehicles.map(v => v._id) } },
      { driver: { $in: matchingDrivers.map(d => d._id) } },
    ];
  }

  const parsedPage = Math.max(1, parseInt(page, 10));
  const parsedLimit = Math.max(1, parseInt(limit, 10));
  const skip = (parsedPage - 1) * parsedLimit;

  // Sorting
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }

  const total = await Trip.countDocuments(query);
  const trips = await Trip.find(query)
    .populate('vehicle')
    .populate('driver')
    .sort(sort)
    .skip(skip)
    .limit(parsedLimit);

  return {
    trips,
    total,
    pages: Math.ceil(total / parsedLimit),
    currentPage: parsedPage,
    limit: parsedLimit,
  };
};

/**
 * Get single trip by ID
 */
const getTripById = async (id) => {
  return await Trip.findById(id).populate('vehicle').populate('driver');
};

/**
 * Helper to validate a vehicle against assignment rules
 */
const validateVehicleForTrip = async (vehicleId, cargoWeight, isDispatching, currentTripId = null) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.status = 404;
    throw error;
  }

  // 1. Retired Vehicle cannot be assigned
  if (vehicle.status === 'Retired') {
    const error = new Error(`Vehicle ${vehicle.name} is Retired and cannot be assigned`);
    error.status = 400;
    throw error;
  }

  // 2. Cargo Weight must not exceed vehicle capacity
  if (cargoWeight > vehicle.maxCapacity) {
    const error = new Error(`Cargo weight (${cargoWeight} tons) exceeds maximum capacity of vehicle ${vehicle.name} (${vehicle.maxCapacity} tons)`);
    error.status = 400;
    throw error;
  }

  if (isDispatching) {
    // 3. In Shop Vehicle cannot be assigned
    if (vehicle.status === 'In Shop') {
      const error = new Error(`Vehicle ${vehicle.name} is In Shop and cannot be dispatched`);
      error.status = 400;
      throw error;
    }

    // 4. Vehicle already On Trip cannot be assigned (unless on this trip already)
    if (vehicle.status === 'On Trip') {
      // Find if this vehicle is on another dispatched trip
      const otherActiveTrip = await Trip.findOne({
        vehicle: vehicleId,
        status: 'Dispatched',
        _id: { $ne: currentTripId },
      });
      if (otherActiveTrip) {
        const error = new Error(`Vehicle ${vehicle.name} is already On Trip and cannot be assigned`);
        error.status = 400;
        throw error;
      }
    }
  }

  return vehicle;
};

/**
 * Helper to validate a driver against assignment rules
 */
const validateDriverForTrip = async (driverId, isDispatching, currentTripId = null) => {
  const driver = await Driver.findById(driverId);
  if (!driver) {
    const error = new Error('Driver not found');
    error.status = 404;
    throw error;
  }

  // 1. Suspended Driver cannot be assigned
  if (driver.status === 'Suspended') {
    const error = new Error(`Driver ${driver.name} is Suspended and cannot be assigned`);
    error.status = 400;
    throw error;
  }

  // 2. Expired License cannot be assigned
  const today = new Date();
  if (new Date(driver.expiryDate) < today) {
    const error = new Error(`Driver ${driver.name} has an expired license (Expired on ${new Date(driver.expiryDate).toLocaleDateString()}) and cannot be assigned`);
    error.status = 400;
    throw error;
  }

  if (isDispatching) {
    // 3. Driver already On Trip cannot be assigned (unless on this trip already)
    if (driver.status === 'On Trip') {
      const otherActiveTrip = await Trip.findOne({
        driver: driverId,
        status: 'Dispatched',
        _id: { $ne: currentTripId },
      });
      if (otherActiveTrip) {
        const error = new Error(`Driver ${driver.name} is already On Trip and cannot be assigned`);
        error.status = 400;
        throw error;
      }
    }
  }

  return driver;
};

/**
 * Create a new trip
 */
const createTrip = async (tripData) => {
  const isDispatching = tripData.status === 'Dispatched';

  // Validate vehicle & driver assignments
  await validateVehicleForTrip(tripData.vehicle, tripData.cargoWeight, isDispatching);
  await validateDriverForTrip(tripData.driver, isDispatching);

  const trip = new Trip(tripData);
  const savedTrip = await trip.save();

  // Automatic Dispatch Transitions
  if (isDispatching) {
    await Vehicle.findByIdAndUpdate(tripData.vehicle, { status: 'On Trip' });
    await Driver.findByIdAndUpdate(tripData.driver, { status: 'On Trip' });
  }

  return await getTripById(savedTrip._id);
};

/**
 * Update a trip and automate state transitions
 */
const updateTrip = async (id, tripData) => {
  const oldTrip = await Trip.findById(id);
  if (!oldTrip) {
    const error = new Error('Trip not found');
    error.status = 404;
    throw error;
  }

  // If trip is Completed or Cancelled, freeze editing (allow only delete or view)
  if (oldTrip.status === 'Completed' || oldTrip.status === 'Cancelled') {
    const error = new Error(`Cannot update trip. Trip is already ${oldTrip.status}`);
    error.status = 400;
    throw error;
  }

  const finalStatus = tripData.status || oldTrip.status;
  const isDispatching = finalStatus === 'Dispatched';

  const finalVehicleId = tripData.vehicle || oldTrip.vehicle.toString();
  const finalDriverId = tripData.driver || oldTrip.driver.toString();
  const finalWeight = tripData.cargoWeight !== undefined ? tripData.cargoWeight : oldTrip.cargoWeight;

  // Validate assignments
  await validateVehicleForTrip(finalVehicleId, finalWeight, isDispatching, id);
  await validateDriverForTrip(finalDriverId, isDispatching, id);

  // Status transitions
  const statusChanged = tripData.status && tripData.status !== oldTrip.status;
  const vehicleChanged = tripData.vehicle && tripData.vehicle.toString() !== oldTrip.vehicle.toString();
  const driverChanged = tripData.driver && tripData.driver.toString() !== oldTrip.driver.toString();

  // If status is transitioning to Dispatched:
  if (statusChanged && finalStatus === 'Dispatched') {
    await Vehicle.findByIdAndUpdate(finalVehicleId, { status: 'On Trip' });
    await Driver.findByIdAndUpdate(finalDriverId, { status: 'On Trip' });
  }

  // If status is transitioning to Completed:
  else if (statusChanged && finalStatus === 'Completed') {
    await Vehicle.findByIdAndUpdate(oldTrip.vehicle, { status: 'Available' });
    await Driver.findByIdAndUpdate(oldTrip.driver, { status: 'Available' });
  }

  // If status is transitioning to Cancelled (restores previous status -> Available):
  else if (statusChanged && finalStatus === 'Cancelled') {
    if (oldTrip.status === 'Dispatched') {
      await Vehicle.findByIdAndUpdate(oldTrip.vehicle, { status: 'Available' });
      await Driver.findByIdAndUpdate(oldTrip.driver, { status: 'Available' });
    }
  }

  // Handle mid-trip vehicle/driver reassignments (if already dispatched)
  if (oldTrip.status === 'Dispatched') {
    if (vehicleChanged) {
      // Revert old vehicle back to Available
      await Vehicle.findByIdAndUpdate(oldTrip.vehicle, { status: 'Available' });
      // Set new vehicle to On Trip
      await Vehicle.findByIdAndUpdate(finalVehicleId, { status: 'On Trip' });
    }
    if (driverChanged) {
      // Revert old driver back to Available
      await Driver.findByIdAndUpdate(oldTrip.driver, { status: 'Available' });
      // Set new driver to On Trip
      await Driver.findByIdAndUpdate(finalDriverId, { status: 'On Trip' });
    }
  }

  const updatedTrip = await Trip.findByIdAndUpdate(id, tripData, {
    new: true,
    runValidators: true,
  });

  return await getTripById(updatedTrip._id);
};

/**
 * Delete a trip
 */
const deleteTrip = async (id) => {
  const trip = await Trip.findById(id);
  if (!trip) {
    const error = new Error('Trip not found');
    error.status = 404;
    throw error;
  }

  // If deleted trip was Dispatched, free up the vehicle and driver status
  if (trip.status === 'Dispatched') {
    await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
    await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });
  }

  await Trip.findByIdAndDelete(id);
  return { message: 'Trip deleted successfully' };
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
};

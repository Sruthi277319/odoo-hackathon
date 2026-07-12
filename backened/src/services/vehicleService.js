const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

/**
 * Get all vehicles with pagination, search, sorting and filtering
 */
const getVehicles = async ({
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

  // Search Filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { registrationNumber: { $regex: search, $options: 'i' } },
      { type: { $regex: search, $options: 'i' } },
      { region: { $regex: search, $options: 'i' } },
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

  const total = await Vehicle.countDocuments(query);
  const vehicles = await Vehicle.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parsedLimit);

  return {
    vehicles,
    total,
    pages: Math.ceil(total / parsedLimit),
    currentPage: parsedPage,
    limit: parsedLimit,
  };
};

/**
 * Get single vehicle by ID
 */
const getVehicleById = async (id) => {
  return await Vehicle.findById(id);
};

/**
 * Create a new vehicle
 */
const createVehicle = async (vehicleData) => {
  // Check registration number uniqueness manually for cleaner response
  const existingVehicle = await Vehicle.findOne({
    registrationNumber: vehicleData.registrationNumber.toUpperCase().trim(),
  });
  if (existingVehicle) {
    const error = new Error('A vehicle with this registration number already exists');
    error.status = 400;
    throw error;
  }

  const vehicle = new Vehicle({
    ...vehicleData,
    registrationNumber: vehicleData.registrationNumber.toUpperCase().trim(),
  });
  return await vehicle.save();
};

/**
 * Update a vehicle
 */
const updateVehicle = async (id, vehicleData) => {
  // Check registration number uniqueness if it is changing
  if (vehicleData.registrationNumber) {
    const regNum = vehicleData.registrationNumber.toUpperCase().trim();
    const existingVehicle = await Vehicle.findOne({
      registrationNumber: regNum,
      _id: { $ne: id },
    });
    if (existingVehicle) {
      const error = new Error('A vehicle with this registration number already exists');
      error.status = 400;
      throw error;
    }
    vehicleData.registrationNumber = regNum;
  }

  // If status is updated to Retired, verify it has no active dispatched trips
  if (vehicleData.status === 'Retired') {
    const activeTrips = await Trip.findOne({ vehicle: id, status: 'Dispatched' });
    if (activeTrips) {
      const error = new Error('Cannot retire vehicle. It is currently assigned to a dispatched trip');
      error.status = 400;
      throw error;
    }
  }

  const vehicle = await Vehicle.findByIdAndUpdate(id, vehicleData, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.status = 404;
    throw error;
  }

  return vehicle;
};

/**
 * Delete a vehicle
 */
const deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.status = 404;
    throw error;
  }

  // Cannot delete vehicle if it is assigned to an active dispatched trip
  const activeTrips = await Trip.findOne({ vehicle: id, status: 'Dispatched' });
  if (activeTrips) {
    const error = new Error('Cannot delete vehicle. It is currently assigned to an active dispatched trip');
    error.status = 400;
    throw error;
  }

  // Also clean up or delete associate trips? Let's just block if any trips exist, or delete them.
  // Blocking deletion if any trips exist (draft or dispatched) is safer, or we delete the vehicle itself.
  // Let's allow deletion but alert, or delete vehicle and remove it. Yes, we will just delete the vehicle.
  await Vehicle.findByIdAndDelete(id);
  return { message: 'Vehicle deleted successfully' };
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};

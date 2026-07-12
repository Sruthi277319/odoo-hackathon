const Driver = require('../models/Driver');
const Trip = require('../models/Trip');

/**
 * Get all drivers with pagination, search, sorting and filtering
 */
const getDrivers = async ({
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
      { licenseNumber: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
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

  const total = await Driver.countDocuments(query);
  const drivers = await Driver.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parsedLimit);

  return {
    drivers,
    total,
    pages: Math.ceil(total / parsedLimit),
    currentPage: parsedPage,
    limit: parsedLimit,
  };
};

/**
 * Get single driver by ID
 */
const getDriverById = async (id) => {
  return await Driver.findById(id);
};

/**
 * Create a new driver
 */
const createDriver = async (driverData) => {
  // Check license uniqueness
  const existingDriver = await Driver.findOne({
    licenseNumber: driverData.licenseNumber.toUpperCase().trim(),
  });
  if (existingDriver) {
    const error = new Error('A driver with this license number already exists');
    error.status = 400;
    throw error;
  }

  const driver = new Driver({
    ...driverData,
    licenseNumber: driverData.licenseNumber.toUpperCase().trim(),
  });
  return await driver.save();
};

/**
 * Update a driver
 */
const updateDriver = async (id, driverData) => {
  // Check license uniqueness if it is changing
  if (driverData.licenseNumber) {
    const licNum = driverData.licenseNumber.toUpperCase().trim();
    const existingDriver = await Driver.findOne({
      licenseNumber: licNum,
      _id: { $ne: id },
    });
    if (existingDriver) {
      const error = new Error('A driver with this license number already exists');
      error.status = 400;
      throw error;
    }
    driverData.licenseNumber = licNum;
  }

  // If status is updated to Suspended or Off Duty, verify they have no active dispatched trips
  if (driverData.status === 'Suspended' || driverData.status === 'Off Duty') {
    const activeTrips = await Trip.findOne({ driver: id, status: 'Dispatched' });
    if (activeTrips) {
      const error = new Error(`Cannot set driver status to ${driverData.status}. They are currently assigned to a dispatched trip`);
      error.status = 400;
      throw error;
    }
  }

  const driver = await Driver.findByIdAndUpdate(id, driverData, {
    new: true,
    runValidators: true,
  });

  if (!driver) {
    const error = new Error('Driver not found');
    error.status = 404;
    throw error;
  }

  return driver;
};

/**
 * Delete a driver
 */
const deleteDriver = async (id) => {
  const driver = await Driver.findById(id);
  if (!driver) {
    const error = new Error('Driver not found');
    error.status = 404;
    throw error;
  }

  // Cannot delete driver if they are assigned to an active dispatched trip
  const activeTrips = await Trip.findOne({ driver: id, status: 'Dispatched' });
  if (activeTrips) {
    const error = new Error('Cannot delete driver. They are currently assigned to an active dispatched trip');
    error.status = 400;
    throw error;
  }

  await Driver.findByIdAndDelete(id);
  return { message: 'Driver deleted successfully' };
};

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
};

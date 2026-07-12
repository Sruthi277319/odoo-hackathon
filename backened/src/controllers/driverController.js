const driverService = require('../services/driverService');

// @desc    Get all drivers with query options
// @route   GET /api/drivers
// @access  Private
const getDrivers = async (req, res, next) => {
  try {
    const { page, limit, search, sortBy, sortOrder, status } = req.query;
    const result = await driverService.getDrivers({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      status,
    });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver by ID
// @route   GET /api/drivers/:id
// @access  Private
const getDriverById = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }
    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private
const createDriver = async (req, res, next) => {
  try {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json({
      success: true,
      data: driver,
      message: 'Driver created successfully',
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private
const updateDriver = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: driver,
      message: 'Driver updated successfully',
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private
const deleteDriver = async (req, res, next) => {
  try {
    const result = await driverService.deleteDriver(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
};

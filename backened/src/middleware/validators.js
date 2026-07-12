const { body } = require('express-validator');
const { validateFields } = require('./validateMiddleware');

// === VEHICLE VALIDATORS ===
const validateVehicle = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Vehicle name is required')
    .isLength({ max: 50 })
    .withMessage('Vehicle name must not exceed 50 characters'),
  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required')
    .toUpperCase()
    .matches(/^[A-Z0-9- ]+$/)
    .withMessage('Registration number must contain only alphanumeric characters, dashes, or spaces'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Vehicle type is required'),
  body('maxCapacity')
    .notEmpty()
    .withMessage('Maximum capacity is required')
    .isFloat({ min: 0.1 })
    .withMessage('Maximum capacity must be a positive number'),
  body('odometer')
    .notEmpty()
    .withMessage('Odometer reading is required')
    .isFloat({ min: 0 })
    .withMessage('Odometer reading must be a non-negative number'),
  body('acquisitionCost')
    .notEmpty()
    .withMessage('Acquisition cost is required')
    .isFloat({ min: 0 })
    .withMessage('Acquisition cost must be a non-negative number'),
  body('region')
    .trim()
    .notEmpty()
    .withMessage('Operating region is required'),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'In Shop', 'Retired'])
    .withMessage('Invalid status. Must be Available, On Trip, In Shop, or Retired'),
  validateFields,
];

const validateVehicleUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vehicle name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Vehicle name must not exceed 50 characters'),
  body('registrationNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Registration number cannot be empty')
    .toUpperCase()
    .matches(/^[A-Z0-9- ]+$/)
    .withMessage('Registration number must contain only alphanumeric characters, dashes, or spaces'),
  body('type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vehicle type cannot be empty'),
  body('maxCapacity')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Maximum capacity must be a positive number'),
  body('odometer')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Odometer reading must be a non-negative number'),
  body('acquisitionCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Acquisition cost must be a non-negative number'),
  body('region')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Operating region cannot be empty'),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'In Shop', 'Retired'])
    .withMessage('Invalid status. Must be Available, On Trip, In Shop, or Retired'),
  validateFields,
];

// === DRIVER VALIDATORS ===
const validateDriver = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Driver name is required')
    .isLength({ max: 50 })
    .withMessage('Driver name must not exceed 50 characters'),
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License number is required')
    .toUpperCase()
    .matches(/^[A-Z0-9- ]+$/)
    .withMessage('License number must contain only alphanumeric characters, dashes, or spaces'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('License category is required'),
  body('expiryDate')
    .notEmpty()
    .withMessage('License expiry date is required')
    .isISO8601()
    .withMessage('License expiry date must be a valid date'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('safetyScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Safety score must be between 0 and 100'),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'Off Duty', 'Suspended'])
    .withMessage('Invalid status. Must be Available, On Trip, Off Duty, or Suspended'),
  validateFields,
];

const validateDriverUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Driver name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Driver name must not exceed 50 characters'),
  body('licenseNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('License number cannot be empty')
    .toUpperCase()
    .matches(/^[A-Z0-9- ]+$/)
    .withMessage('License number must contain only alphanumeric characters, dashes, or spaces'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('License category cannot be empty'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('License expiry date must be a valid date'),
  body('phoneNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty'),
  body('safetyScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Safety score must be between 0 and 100'),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'Off Duty', 'Suspended'])
    .withMessage('Invalid status. Must be Available, On Trip, Off Duty, or Suspended'),
  validateFields,
];

// === TRIP VALIDATORS ===
const validateTrip = [
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Source location is required'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination location is required'),
  body('cargoWeight')
    .notEmpty()
    .withMessage('Cargo weight is required')
    .isFloat({ min: 0.1 })
    .withMessage('Cargo weight must be a positive number'),
  body('distance')
    .notEmpty()
    .withMessage('Distance is required')
    .isFloat({ min: 0.1 })
    .withMessage('Distance must be a positive number'),
  body('vehicle')
    .notEmpty()
    .withMessage('Vehicle assignment is required')
    .isMongoId()
    .withMessage('Invalid vehicle assigned'),
  body('driver')
    .notEmpty()
    .withMessage('Driver assignment is required')
    .isMongoId()
    .withMessage('Invalid driver assigned'),
  body('revenue')
    .notEmpty()
    .withMessage('Revenue is required')
    .isFloat({ min: 0 })
    .withMessage('Revenue must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['Draft', 'Dispatched', 'Completed', 'Cancelled'])
    .withMessage('Invalid status. Must be Draft, Dispatched, Completed, or Cancelled'),
  validateFields,
];

const validateTripUpdate = [
  body('source')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Source location cannot be empty'),
  body('destination')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Destination location cannot be empty'),
  body('cargoWeight')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Cargo weight must be a positive number'),
  body('distance')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Distance must be a positive number'),
  body('vehicle')
    .optional()
    .isMongoId()
    .withMessage('Invalid vehicle assigned'),
  body('driver')
    .optional()
    .isMongoId()
    .withMessage('Invalid driver assigned'),
  body('revenue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Revenue must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['Draft', 'Dispatched', 'Completed', 'Cancelled'])
    .withMessage('Invalid status. Must be Draft, Dispatched, Completed, or Cancelled'),
  validateFields,
];

module.exports = {
  validateVehicle,
  validateVehicleUpdate,
  validateDriver,
  validateDriverUpdate,
  validateTrip,
  validateTripUpdate,
};

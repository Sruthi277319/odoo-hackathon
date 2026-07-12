const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a driver name'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please add a license number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a driver category (e.g. CDL Class A)'],
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add the license expiry date'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true,
    },
    safetyScore: {
      type: Number,
      required: [true, 'Please add a safety score'],
      min: [0, 'Safety score cannot be less than 0'],
      max: [100, 'Safety score cannot be greater than 100'],
      default: 100,
    },
    status: {
      type: String,
      required: [true, 'Please add the driver status'],
      enum: {
        values: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
        message: 'Status must be Available, On Trip, Off Duty, or Suspended',
      },
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Driver', driverSchema);

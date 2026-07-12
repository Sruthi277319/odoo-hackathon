const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a vehicle name'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Please add a registration number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: [true, 'Please add a vehicle type'],
      trim: true,
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Please add the maximum cargo capacity'],
      min: [0, 'Maximum capacity cannot be negative'],
    },
    odometer: {
      type: Number,
      required: [true, 'Please add the current odometer reading'],
      min: [0, 'Odometer reading cannot be negative'],
    },
    acquisitionCost: {
      type: Number,
      required: [true, 'Please add the acquisition cost'],
      min: [0, 'Acquisition cost cannot be negative'],
    },
    region: {
      type: String,
      required: [true, 'Please add the operating region'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Please add the vehicle status'],
      enum: {
        values: ['Available', 'On Trip', 'In Shop', 'Retired'],
        message: 'Status must be Available, On Trip, In Shop, or Retired',
      },
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, 'Please add a source location'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Please add a destination location'],
      trim: true,
    },
    cargoWeight: {
      type: Number,
      required: [true, 'Please add the cargo weight'],
      min: [0, 'Cargo weight cannot be negative'],
    },
    distance: {
      type: Number,
      required: [true, 'Please add the trip distance'],
      min: [0, 'Distance cannot be negative'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Please assign a vehicle'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Please assign a driver'],
    },
    revenue: {
      type: Number,
      required: [true, 'Please add the trip revenue'],
      min: [0, 'Revenue cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Please add the trip status'],
      enum: {
        values: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        message: 'Status must be Draft, Dispatched, Completed, or Cancelled',
      },
      default: 'Draft',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);

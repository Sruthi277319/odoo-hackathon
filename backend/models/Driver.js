import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    licenseExpiryDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number, // 1.0 - 5.0
      required: true,
      min: 1,
      max: 5,
      default: 5.0,
    },
    safetyScore: {
      type: Number, // 0 - 100
      required: true,
      min: 0,
      max: 100,
      default: 100,
    },
    tripsCompleted: {
      type: Number,
      required: true,
      default: 0,
    },
    fuelEfficiencyScore: {
      type: Number, // 0 - 100 (driver behavior score)
      required: true,
      min: 0,
      max: 100,
      default: 85,
    },
  },
  {
    timestamps: true,
  }
);

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;

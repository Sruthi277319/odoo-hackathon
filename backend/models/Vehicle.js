import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'In Shop', 'Out of Service'],
      default: 'Available',
    },
    odometer: {
      type: Number,
      required: true,
      default: 0,
    },
    fuelCapacity: {
      type: Number, // in liters
      required: true,
      default: 60,
    },
    healthScore: {
      type: Number, // 0 - 100
      required: true,
      min: 0,
      max: 100,
      default: 100,
    },
    lastMaintenanceDate: {
      type: Date,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    type: {
      type: String,
      required: true,
      enum: ['Truck', 'Van', 'Sedan', 'SUV', 'Reefer'],
      default: 'Truck',
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['Diesel', 'Gasoline', 'Electric', 'Hybrid'],
      default: 'Diesel',
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;

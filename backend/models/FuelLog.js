import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    fuelAmount: {
      type: Number, // In Liters
      required: true,
    },
    cost: {
      type: Number, // In Currency units
      required: true,
    },
    distance: {
      type: Number, // Distance traveled (km or miles) since last refuel
      required: true,
    },
    odometer: {
      type: Number, // Current vehicle odometer reading
      required: true,
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['Diesel', 'Gasoline', 'Electricity', 'LPG'],
      default: 'Diesel',
    },
  },
  {
    timestamps: true,
  }
);

const FuelLog = mongoose.model('FuelLog', fuelLogSchema);
export default FuelLog;

import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Routine', 'Repair', 'Inspection'],
      default: 'Routine',
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'Scheduled',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;

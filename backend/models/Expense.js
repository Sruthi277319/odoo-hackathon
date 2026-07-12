import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['Fuel', 'Maintenance', 'Toll', 'Other'],
      default: 'Other',
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: false,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;

import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  frequency: {
    type: String,
    enum: ['Weekly', 'Monthly', 'Yearly'],
    default: 'Monthly'
  },
  nextPaymentDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    default: "Subscription"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);

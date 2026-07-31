import mongoose from "mongoose";

const SettlementSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    splitAmong: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amountOwed: { type: Number, required: true },
        hasSettled: { type: Boolean, default: false }
    }],
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("Settlement", SettlementSchema);

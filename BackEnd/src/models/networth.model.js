import mongoose from "mongoose";

const NetWorthSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assets: [{
        name: { type: String, required: true },
        value: { type: Number, required: true },
        category: { type: String, enum: ["Cash", "Investments", "Real Estate", "Other"], default: "Cash" }
    }],
    liabilities: [{
        name: { type: String, required: true },
        value: { type: Number, required: true },
        category: { type: String, enum: ["Credit Card", "Loan", "Mortgage", "Other"], default: "Loan" }
    }],
    totalNetWorth: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("NetWorth", NetWorthSchema);

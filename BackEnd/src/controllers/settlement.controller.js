import Settlement from "../models/settlement.model.js";
import User from "../models/user.model.js";

// Fetch settlements involving the user
export const getSettlements = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ message: "userId required" });

        const settlements = await Settlement.find({
            $or: [
                { paidBy: userId },
                { "splitAmong.user": userId }
            ]
        }).populate("paidBy", "username email").populate("splitAmong.user", "username email").sort({ date: -1 });

        res.status(200).json(settlements);
    } catch (error) {
        console.error("Error fetching settlements:", error);
        res.status(500).json({ message: "Failed to fetch settlements" });
    }
};

// Create a new expense split
export const createSettlement = async (req, res) => {
    try {
        const { description, amount, paidBy, splitAmong } = req.body;
        if (!description || !amount || !paidBy || !splitAmong || splitAmong.length === 0) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newSettlement = new Settlement({
            description,
            amount,
            paidBy,
            splitAmong
        });

        await newSettlement.save();
        res.status(201).json(newSettlement);
    } catch (error) {
        console.error("Error creating settlement:", error);
        res.status(500).json({ message: "Failed to create settlement" });
    }
};

// Settle up a specific user's share
export const settleUp = async (req, res) => {
    try {
        const { settlementId, userId } = req.body;
        if (!settlementId || !userId) {
            return res.status(400).json({ message: "settlementId and userId required" });
        }

        const settlement = await Settlement.findById(settlementId);
        if (!settlement) return res.status(404).json({ message: "Settlement not found" });

        const shareIndex = settlement.splitAmong.findIndex(s => s.user.toString() === userId);
        if (shareIndex !== -1) {
            settlement.splitAmong[shareIndex].hasSettled = true;
            await settlement.save();
            return res.status(200).json(settlement);
        }

        res.status(404).json({ message: "User not part of this settlement" });
    } catch (error) {
        console.error("Error settling up:", error);
        res.status(500).json({ message: "Failed to settle up" });
    }
};

// Get all users for the search dropdown
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "username email _id");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

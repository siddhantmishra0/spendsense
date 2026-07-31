import User from "../models/user.model.js";

export const getProgress = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.gamification);
    } catch (error) {
        console.error("Error fetching gamification progress:", error);
        res.status(500).json({ message: "Failed to fetch gamification progress" });
    }
};

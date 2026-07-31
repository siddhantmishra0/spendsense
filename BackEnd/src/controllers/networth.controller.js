import NetWorth from "../models/networth.model.js";

export const getNetWorthHistory = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ message: "userId required" });

        const history = await NetWorth.find({ userId }).sort({ date: 1 });
        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching net worth:", error);
        res.status(500).json({ message: "Failed to fetch net worth history" });
    }
};

export const updateNetWorth = async (req, res) => {
    try {
        const { userId, assets, liabilities, date } = req.body;
        if (!userId) return res.status(400).json({ message: "userId required" });

        const totalAssets = (assets || []).reduce((acc, curr) => acc + Number(curr.value), 0);
        const totalLiabilities = (liabilities || []).reduce((acc, curr) => acc + Number(curr.value), 0);
        const totalNetWorth = totalAssets - totalLiabilities;

        const newEntry = new NetWorth({
            userId,
            assets: assets || [],
            liabilities: liabilities || [],
            totalNetWorth,
            date: date || new Date()
        });

        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        console.error("Error updating net worth:", error);
        res.status(500).json({ message: "Failed to update net worth" });
    }
};

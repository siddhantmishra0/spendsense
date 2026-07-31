import { generateInsights, chatWithAssistant, categorizeExpense, parseReceiptText } from "../services/ai.service.js";
import User from "../models/user.model.js";
import Expense from "../models/expense.model.js";

export const getInsights = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch user's recent expenses (e.g., last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const expenses = await Expense.find({
            userId: userId,
            date: { $gte: threeMonthsAgo }
        });

        if (expenses.length === 0) {
            return res.status(200).json({
                recommendations: [
                    {
                        title: "Add more expenses",
                        impact: "Low Impact",
                        subtitle: "We need more expense data to generate personalized AI insights.",
                        potential: 0
                    }
                ],
                totalSavingsPotential: 0
            });
        }

        // Prepare data for the AI
        const expenseData = {
            totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
            expenseCount: expenses.length,
            categories: {}
        };

        expenses.forEach(exp => {
            const cat = exp.category || "Other";
            expenseData.categories[cat] = (expenseData.categories[cat] || 0) + exp.amount;
        });

        const insights = await generateInsights(expenseData);
        res.status(200).json(insights);
    } catch (error) {
        console.error("Error in getInsights:", error);
        res.status(500).json({ message: error.message || "Failed to generate AI insights" });
    }
};

export const chat = async (req, res) => {
    try {
        const { userId, messages } = req.body;
        if (!userId || !messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: "Invalid request payload" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Provide context to the AI
        const expenses = await Expense.find({ userId: userId }).sort({ date: -1 }).limit(50);
        
        const userContext = {
            name: user.username,
            currencyPreference: user.preferences?.currency || "USD",
            recentExpenses: expenses.map(e => ({
                amount: e.amount,
                category: e.category,
                date: e.date,
                description: e.description
            }))
        };

        const reply = await chatWithAssistant(messages, userContext);
        res.status(200).json({ reply });
    } catch (error) {
        console.error("Error in chat:", error);
        res.status(500).json({ message: error.message || "Failed to chat with AI" });
    }
};

export const categorize = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ message: "Description is required" });
        }
        
        const category = await categorizeExpense(description);
        res.status(200).json({ category });
    } catch (error) {
        console.error("Error in categorize:", error);
        res.status(500).json({ message: error.message || "Failed to categorize expense" });
    }
};

export const parseReceipt = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: "Receipt text is required" });
        }
        
        const parsedData = await parseReceiptText(text);
        res.status(200).json(parsedData);
    } catch (error) {
        console.error("Error in parseReceipt:", error);
        res.status(500).json({ message: error.message || "Failed to parse receipt" });
    }
};

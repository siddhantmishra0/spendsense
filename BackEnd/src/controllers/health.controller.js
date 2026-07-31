import User from "../models/user.model.js";
import Expense from "../models/expense.model.js";
import Budget from "../models/budget.model.js";

export const getHealthScore = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate score if it hasn't been calculated today
        const lastCalculated = user.healthScore?.lastCalculated;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let score = user.healthScore?.score || 0;

        // If not calculated today, recalculate
        if (!lastCalculated || new Date(lastCalculated) < today) {
            score = await calculateFinancialHealthScore(userId);
            
            // Save to user
            user.healthScore = {
                score,
                lastCalculated: now
            };
            await user.save();
        }

        res.status(200).json({ score, lastCalculated: user.healthScore?.lastCalculated });
    } catch (error) {
        console.error("Error calculating health score:", error);
        res.status(500).json({ message: "Failed to fetch health score" });
    }
};

async function calculateFinancialHealthScore(userId) {
    let score = 50; // Base score

    try {
        const expenses = await Expense.find({ user: userId });
        const budgets = await Budget.find({ user: userId });

        if (expenses.length === 0 || budgets.length === 0) {
            return 50; // Default if not enough data
        }

        const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const thisMonthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        });

        const totalSpentThisMonth = thisMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

        if (totalBudget > 0) {
            const spentRatio = totalSpentThisMonth / totalBudget;
            
            if (spentRatio < 0.5) score += 30; // Excellent, well below budget
            else if (spentRatio < 0.8) score += 20; // Good, within budget
            else if (spentRatio <= 1.0) score += 10; // Okay, just at budget
            else if (spentRatio < 1.2) score -= 10; // Over budget a bit
            else score -= 30; // Significantly over budget
        }

        // Consistency bonus
        if (expenses.length > 20) score += 10; // Good tracking habit
        if (budgets.length > 3) score += 10; // Categorized tracking habit

        // Clamp between 0 and 100
        return Math.min(Math.max(score, 0), 100);
    } catch (e) {
        console.error("Score calculation error", e);
        return 50;
    }
}

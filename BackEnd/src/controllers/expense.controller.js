import ExpenseModel from "../models/expense.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import { awardPoints } from "../services/gamification.service.js";

const getExpenses = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?._id;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const expenses = await ExpenseModel.find({ userId });
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Server error fetching expenses" });
  }
};

const postExpenses = async (req, res) => {
  try {
    const { description, amount, date, category, tags, userId } = req.body;
    if (!description || !amount || !date || !category || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const newExpense = new ExpenseModel({
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      category,
      tags: tags || [],
      userId,
    });
    await newExpense.save();
    
    // Award 10 points for adding an expense
    await awardPoints(userId, 10);
    
    return res.status(201).json({ expense: newExpense });
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const postBulkExpenses = async (req, res) => {
  try {
    const { expenses, userId } = req.body;
    if (!expenses || !Array.isArray(expenses) || !userId) {
      return res.status(400).json({ error: "Invalid payload for bulk upload" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newExpenses = expenses.map(exp => ({
      description: exp.description,
      amount: parseFloat(exp.amount),
      date: new Date(exp.date),
      category: exp.category || "Other",
      tags: exp.tags || [],
      userId,
    }));

    await ExpenseModel.insertMany(newExpenses);
    
    // Award 50 points for a bulk import
    await awardPoints(userId, 50);

    return res.status(201).json({ message: `Successfully imported ${newExpenses.length} expenses` });
  } catch (error) {
    console.error("Error saving bulk expenses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteExpenses = async (req, res) => {
  try {
    const result = await ExpenseModel.findOneAndDelete({
      userId: req.user._id,
      _id: req.params.id,
    });
    if (!result) return res.status(404).json({ error: "Expense not found" });
    console.log(
      "Deleting Expense with ID:",
      req.params.id,
      "for User:",
      req.user._id
    );
    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting expense" });
  }
};

const deleteExpensesByCategory = async (req, res) => {
  try {
    const { userId, category } = req.body;

    // Validation
    if (!userId || !category) {
      return res.status(400).json({
        error: "Missing required fields: userId and category",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Delete ALL expenses matching userId AND category
    const result = await ExpenseModel.deleteMany({
      userId: userId,
      category: category,
    });

    console.log(
      `Deleted ${result.deletedCount} expense(s) with category: ${category} for User: ${userId}`
    );

    return res.status(200).json({
      message: "Expenses deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting expenses:", error);
    return res.status(500).json({
      error: "Error deleting expenses",
      details: error.message,
    });
  }
};

export {
  getExpenses,
  postExpenses,
  postBulkExpenses,
  deleteExpenses,
  deleteExpensesByCategory
};

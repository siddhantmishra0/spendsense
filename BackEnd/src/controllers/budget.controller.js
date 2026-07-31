import BudgetModel from "../models/budget.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

const postBudget = async (req, res) => {
  try {
    const { userId, budgetAmount, budgetType } = req.body;
    if (!userId || !budgetAmount || !budgetType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const existingBudget = await BudgetModel.findOne({ userId,category:budgetType });
    let updatedBudget;
    let newBudgetAmount = parseFloat(budgetAmount);
    let budgetDifference = newBudgetAmount;
    if (existingBudget) {
      budgetDifference = newBudgetAmount - existingBudget.amount;
      updatedBudget = await BudgetModel.findByIdAndUpdate(
        existingBudget._id,
        { amount: newBudgetAmount },
        { new: true }
      );
    } else {
      updatedBudget = new BudgetModel({
        userId,
        amount: newBudgetAmount,
        category: budgetType,
      });
      await updatedBudget.save();
    }
    const overallCategory = await BudgetModel.findOne({ userId,category: "Overall" });
    let overallBudget;
    if(overallCategory){
      const overallAmount = overallCategory.amount + budgetDifference;
      overallBudget = await BudgetModel.findByIdAndUpdate(
        overallCategory._id,
        {amount: parseFloat(overallAmount)},
        {new: true}
      )
    } else{
      overallBudget = new BudgetModel({
        userId,
        amount: newBudgetAmount,
        category: "Overall"
      })
      await overallBudget.save()
    }
    return res.status(200).json({ newBudget: updatedBudget });
  } catch (error) {
    return res.status(500).json("Budget fail");
  }
};

const getBudget = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const budgets = await BudgetModel.find({ userId: userId }).sort({
      category: 1,
    });

    return res.status(200).json(budgets);
  } catch (error) {
    console.error("Error fetching user budgets:", error);
    return res.status(500).json({
      error: "Failed to fetch budgets",
      details: error.message,
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { amount, category } = req.body;
    const budgetId = req.params.id;
    const userId = req.user._id; 

    if (!budgetId || !mongoose.Types.ObjectId.isValid(budgetId)) {
      return res.status(400).json({ error: "Invalid budget ID format" });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        error: "Missing required field: amount",
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        error: "Amount must be a non-negative number",
      });
    }

    const updatedBudget = await BudgetModel.findOneAndUpdate(
      { _id: budgetId, userId: userId },
      { $set: { amount: numericAmount } },
      { new: true, runValidators: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({
        error: "Budget not found or you don't have permission to update it",
      });
    }

    return res.status(200).json({
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update budget",
      details: error.message,
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const result = await BudgetModel.findOneAndDelete({
      userId: req.user._id,
      _id: req.params.id,
    });

    if (!result) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.status(200).json({
      message: "Budget deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: "Error deleting budget" });
  }
};

export {
  postBudget,
  getBudget,
  updateBudget,
  deleteBudget
};

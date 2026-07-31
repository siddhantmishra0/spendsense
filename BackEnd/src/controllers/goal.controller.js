import GoalModel from "../models/goal.model.js";

const getGoals = async (req, res) => {
  try {
    const goals = await GoalModel.find({ userId: req.user._id });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: "Error fetching goals" });
  }
};

const postGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;
    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newGoal = new GoalModel({
      userId: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline
    });
    await newGoal.save();
    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ error: "Error creating goal" });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { currentAmount } = req.body;
    const updatedGoal = await GoalModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { currentAmount: Number(currentAmount) } },
      { new: true }
    );
    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.status(200).json({ message: "Goal updated", goal: updatedGoal });
  } catch (error) {
    res.status(500).json({ error: "Error updating goal" });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const deletedGoal = await GoalModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!deletedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting goal" });
  }
};

export {
  getGoals,
  postGoal,
  updateGoal,
  deleteGoal
};

import UserModel from "../models/user.model.js";

export const getPreferences = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.preferences || { currency: "INR" });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching preferences" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { currency } = req.body;
    const user = await UserModel.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.preferences = user.preferences || {};
    if (currency) user.preferences.currency = currency;

    await user.save();
    res.status(200).json(user.preferences);
  } catch (error) {
    res.status(500).json({ error: "Server error updating preferences" });
  }
};

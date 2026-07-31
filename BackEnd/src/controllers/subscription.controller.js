import SubscriptionModel from "../models/subscription.model.js";

export const getSubscriptions = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?._id;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const subscriptions = await SubscriptionModel.find({ userId }).sort({ nextPaymentDate: 1 });
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching subscriptions" });
  }
};

export const postSubscription = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?._id;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const { name, amount, currency, frequency, nextPaymentDate, category } = req.body;
    
    if (!name || !amount || !nextPaymentDate) {
      return res.status(400).json({ error: "Missing required fields: name, amount, nextPaymentDate" });
    }

    const newSub = new SubscriptionModel({
      userId,
      name,
      amount: Number(amount),
      currency: currency || "INR",
      frequency: frequency || "Monthly",
      nextPaymentDate,
      category: category || "Subscription",
      isActive: true
    });

    await newSub.save();
    res.status(201).json(newSub);
  } catch (error) {
    res.status(500).json({ error: "Server error creating subscription" });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const sub = await SubscriptionModel.findOneAndDelete({ _id: id, userId });
    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error deleting subscription" });
  }
};

export const toggleSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const sub = await SubscriptionModel.findOne({ _id: id, userId });
    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    sub.isActive = !sub.isActive;
    await sub.save();

    res.status(200).json(sub);
  } catch (error) {
    res.status(500).json({ error: "Server error toggling subscription" });
  }
};

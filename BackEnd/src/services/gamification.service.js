import User from "../models/user.model.js";

const BADGES = {
    FIRST_EXPENSE: { name: "First Step", icon: "🌱", description: "Added your first expense" },
    STREAK_7: { name: "Consistent Tracker", icon: "🔥", description: "Logged expenses 7 days in a row" },
    LEVEL_5: { name: "Budget Master", icon: "👑", description: "Reached Level 5" }
};

export const awardPoints = async (userId, points, activityDate = new Date()) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        // Points & Level
        user.gamification.points += points;
        user.gamification.level = Math.floor(user.gamification.points / 100) + 1;

        // Streak calculation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastAct = user.gamification.lastActivity ? new Date(user.gamification.lastActivity) : null;
        if (lastAct) lastAct.setHours(0, 0, 0, 0);

        if (!lastAct) {
            user.gamification.currentStreak = 1;
        } else {
            const diffTime = Math.abs(today - lastAct);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1) {
                user.gamification.currentStreak += 1;
            } else if (diffDays > 1) {
                user.gamification.currentStreak = 1;
            }
        }

        if (user.gamification.currentStreak > user.gamification.longestStreak) {
            user.gamification.longestStreak = user.gamification.currentStreak;
        }
        
        user.gamification.lastActivity = activityDate;

        // Badge checks
        const existingBadges = user.gamification.badges.map(b => b.name);
        
        if (user.gamification.points > 0 && !existingBadges.includes(BADGES.FIRST_EXPENSE.name)) {
            user.gamification.badges.push(BADGES.FIRST_EXPENSE);
        }
        if (user.gamification.currentStreak >= 7 && !existingBadges.includes(BADGES.STREAK_7.name)) {
            user.gamification.badges.push(BADGES.STREAK_7);
        }
        if (user.gamification.level >= 5 && !existingBadges.includes(BADGES.LEVEL_5.name)) {
            user.gamification.badges.push(BADGES.LEVEL_5);
        }

        await user.save();
        return user.gamification;
    } catch (err) {
        console.error("Gamification error:", err);
    }
};

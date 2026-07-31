import React, { useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Award, Flame, Star, Trophy } from "lucide-react";

export default function Rewards() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        withCredentials: true,
      });
      return res.data.user;
    },
  });

  const { data: progress, isLoading } = useQuery({
    queryKey: ["gamification_progress", user?._id],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/gamification/progress?userId=${user._id}`,
        { withCredentials: true }
      );
      return res.data;
    },
    enabled: !!user?._id,
  });

  if (isLoading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading rewards...</div>;
  }

  if (!progress) {
    return <div className="p-8 text-gray-500">Failed to load gamification data.</div>;
  }

  const progressToNextLevel = (progress.points % 100);

  return (
    <div className="w-full px-4 md:px-6 pb-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Trophy className="text-yellow-500" size={32} /> Your Rewards
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Track your financial milestones, earn points, and level up!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Level Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Star size={100} />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-90">Current Level</h3>
            <div className="text-5xl font-black mt-2 mb-4">{progress.level}</div>
            
            <div className="w-full bg-white/20 rounded-full h-3 mb-2">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-1000" 
                style={{ width: `${progressToNextLevel}%` }} 
              />
            </div>
            <p className="text-sm opacity-90 text-right">
              {progressToNextLevel} / 100 XP to Level {progress.level + 1}
            </p>
          </div>
        </div>

        {/* Points Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 rounded-full mb-4">
            <Award size={36} />
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Points</h3>
          <div className="text-4xl font-bold text-gray-800 dark:text-white mt-1">
            {progress.points}
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-full mb-4">
            <Flame size={36} />
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Current Streak</h3>
          <div className="text-4xl font-bold text-gray-800 dark:text-white mt-1">
            {progress.currentStreak} Days
          </div>
          <p className="text-xs text-gray-400 mt-2">Longest: {progress.longestStreak} days</p>
        </div>
      </div>

      {/* Badges Section */}
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Your Badges</h3>
      
      {progress.badges && progress.badges.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {progress.badges.map((badge, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="text-5xl mb-3">{badge.icon || "🏅"}</div>
              <div className="font-bold text-gray-800 dark:text-white mb-1">{badge.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center">
          <div className="text-4xl mb-4 opacity-50">🏆</div>
          <h4 className="text-lg font-medium text-gray-600 dark:text-gray-300">No badges yet</h4>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Keep tracking your expenses to earn your first badge!</p>
        </div>
      )}
    </div>
  );
}

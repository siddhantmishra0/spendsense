import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Target, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

export default function Goals() {
  const queryClient = useQueryClient();
  const { formatAmount } = useCurrencyFormatter();
  const [showForm, setShowForm] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    deadline: ""
  });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/home/goals`, {
        withCredentials: true
      });
      return res.data;
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/home/goals`, goalData, {
        withCredentials: true
      });
    },
    onSuccess: () => {
      toast.success("Goal created successfully!");
      setNewGoal({ title: "", targetAmount: "", deadline: "" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: () => toast.error("Failed to create goal.")
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, newAmount }) => {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/home/goals/${id}`, {
        currentAmount: newAmount
      }, {
        withCredentials: true
      });
    },
    onSuccess: () => {
      toast.success("Goal updated!");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: () => toast.error("Failed to update goal.")
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/home/goals/${id}`, {
        withCredentials: true
      });
    },
    onSuccess: () => {
      toast.success("Goal deleted!");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: () => toast.error("Failed to delete goal.")
  });

  const handleCreateGoal = (e) => {
    e.preventDefault();
    createGoalMutation.mutate(newGoal);
  };

  const handleUpdateAmount = (id, currentAmount, amountToAdd) => {
    updateGoalMutation.mutate({ id, newAmount: currentAmount + amountToAdd });
  };

  const handleDeleteGoal = (id) => {
    deleteGoalMutation.mutate(id);
  };

  if (isLoading) return <div className="p-4 text-center">Loading goals...</div>;

  return (
    <div className="w-full px-2 md:pl-5 pb-10">
      <div className="border rounded-md p-4 md:p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-semibold text-xl md:text-2xl flex items-center gap-2">
              <Target size={24} /> Financial Goals
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
              Set and track your savings goals
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 bg-black dark:bg-white dark:bg-gray-800 text-white dark:text-black px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 dark:bg-gray-700 transition-colors"
          >
            <Plus size={16} /> {showForm ? "Cancel" : "New Goal"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateGoal} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6 grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">Goal Title</label>
              <input
                type="text"
                required
                className="w-full border rounded-md p-2 dark:bg-gray-600 dark:border-gray-500"
                value={newGoal.title}
                onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="e.g. Vacation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Amount</label>
              <input
                type="number"
                required
                min="1"
                className="w-full border rounded-md p-2 dark:bg-gray-600 dark:border-gray-500"
                value={newGoal.targetAmount}
                onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deadline</label>
              <input
                type="date"
                required
                className="w-full border rounded-md p-2 dark:bg-gray-600 dark:border-gray-500"
                value={newGoal.deadline}
                onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                Save Goal
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-500 dark:text-gray-300">
              No goals set. Create one to get started!
            </div>
          ) : (
            goals.map(goal => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isCompleted = progress >= 100;

              return (
                <div key={goal._id} className="border rounded-md p-4 dark:bg-gray-700 dark:border-gray-600 relative">
                  <button 
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Target: {formatAmount(goal.targetAmount)} | Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 dark:bg-gray-600 overflow-hidden">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>{formatAmount(goal.currentAmount)} Saved ({progress.toFixed(1)}%)</span>
                    {!isCompleted && (
                      <button 
                        onClick={() => {
                          const amount = prompt("How much did you save towards this goal?");
                          if(amount && !isNaN(amount) && Number(amount) > 0) {
                            handleUpdateAmount(goal._id, goal.currentAmount, Number(amount));
                          }
                        }}
                        className="text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                      >
                        <TrendingUp size={14}/> Add Funds
                      </button>
                    )}
                    {isCompleted && <span className="text-green-500 font-semibold">Goal Reached!</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

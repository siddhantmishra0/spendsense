import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

export default function ExpenseSplitter() {
  const { formatAmount } = useCurrencyFormatter();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        withCredentials: true,
      });
      return res.data.user;
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all_users"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/settlements/users`, {
        withCredentials: true,
      });
      return res.data.filter(u => u._id !== user?._id);
    },
    enabled: !!user?._id,
  });

  const { data: settlements = [], isLoading } = useQuery({
    queryKey: ["settlements", user?._id],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/settlements?userId=${user._id}`, {
        withCredentials: true,
      });
      return res.data;
    },
    enabled: !!user?._id,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/settlements`, payload, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["settlements"]);
      toast.success("Expense split created!");
      setIsAdding(false);
      setDescription("");
      setAmount("");
      setSelectedFriends([]);
    },
    onError: () => {
      toast.error("Failed to create expense split.");
    }
  });

  const settleMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/v1/settlements/settle`, payload, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["settlements"]);
      toast.success("Marked as settled!");
    }
  });

  const toggleFriend = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleCreate = () => {
    if (!description || !amount || selectedFriends.length === 0) {
      toast.error("Please fill all fields and select friends.");
      return;
    }

    const numPeople = selectedFriends.length + 1; // Including the user
    const splitAmount = Number(amount) / numPeople;

    const splitAmong = selectedFriends.map(friendId => ({
      user: friendId,
      amountOwed: splitAmount,
      hasSettled: false
    }));

    createMutation.mutate({
      description,
      amount: Number(amount),
      paidBy: user._id,
      splitAmong
    });
  };

  const handleSettle = (settlementId, userId) => {
    settleMutation.mutate({ settlementId, userId });
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading your settlements...</div>;
  }

  return (
    <div className="w-full px-4 md:px-6 pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
            <Users size={24} /> Expense Splitter
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Split bills with friends and keep track of who owes who.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> {isAdding ? "Cancel" : "Add Split Expense"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">New Shared Expense</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Description</label>
              <input
                type="text"
                placeholder="Dinner at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border dark:border-gray-600 rounded-md p-2.5 text-sm dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border dark:border-gray-600 rounded-md p-2.5 text-sm dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Split Equally With</label>
            <div className="flex flex-wrap gap-2">
              {users.map(u => (
                <button
                  key={u._id}
                  onClick={() => toggleFriend(u._id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedFriends.includes(u._id) ? "bg-blue-100 dark:bg-blue-900/50 border-blue-500 text-blue-700 dark:text-blue-300" : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-300"}`}
                >
                  {u.username}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            {createMutation.isPending ? "Creating..." : "Split Expense"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Friends Owe You */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 border-b border-emerald-100 dark:border-emerald-800">
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-400">People Owe You</h3>
          </div>
          <div className="p-0">
            {settlements.filter(s => s.paidBy._id === user?._id).length === 0 && (
              <p className="text-gray-500 text-sm p-6 text-center">No one owes you money.</p>
            )}
            <ul className="divide-y dark:divide-gray-700">
              {settlements.filter(s => s.paidBy._id === user?._id).map(settlement => (
                <li key={settlement._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-800 dark:text-white">{settlement.description}</span>
                    <span className="text-xs text-gray-500">{new Date(settlement.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total: {formatAmount(settlement.amount)}</div>
                  <div className="space-y-2 mt-3">
                    {settlement.splitAmong.map(split => (
                      <div key={split.user._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        <span className="text-sm">{split.user.username}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${split.hasSettled ? "text-gray-400 line-through" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {formatAmount(split.amountOwed)}
                          </span>
                          {!split.hasSettled && (
                            <button
                              onClick={() => handleSettle(settlement._id, split.user._id)}
                              className="text-emerald-500 hover:text-emerald-600"
                              title="Mark as Settled"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* You Owe Friends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-800">
            <h3 className="font-semibold text-red-800 dark:text-red-400">You Owe People</h3>
          </div>
          <div className="p-0">
            {settlements.filter(s => s.splitAmong.some(split => split.user._id === user?._id)).length === 0 && (
              <p className="text-gray-500 text-sm p-6 text-center">You are all settled up!</p>
            )}
            <ul className="divide-y dark:divide-gray-700">
              {settlements.filter(s => s.splitAmong.some(split => split.user._id === user?._id)).map(settlement => {
                const mySplit = settlement.splitAmong.find(s => s.user._id === user?._id);
                return (
                  <li key={settlement._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800 dark:text-white">{settlement.description}</span>
                      <span className="text-xs text-gray-500">{new Date(settlement.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Paid by {settlement.paidBy.username}
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md mt-2">
                      <span className="text-sm">Your Share</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${mySplit.hasSettled ? "text-gray-400 line-through" : "text-red-600 dark:text-red-400"}`}>
                          {formatAmount(mySplit.amountOwed)}
                        </span>
                        {mySplit.hasSettled ? (
                          <CheckCircle size={16} className="text-gray-400" />
                        ) : (
                          <Clock size={16} className="text-red-400" />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

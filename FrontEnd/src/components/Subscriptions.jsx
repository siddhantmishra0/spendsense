import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Calendar, CreditCard, Power } from "lucide-react";
import toast from "react-hot-toast";
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const { formatAmount } = useCurrencyFormatter();
  const [showForm, setShowForm] = useState(false);
  
  const [newSub, setNewSub] = useState({
    name: "",
    amount: "",
    frequency: "Monthly",
    nextPaymentDate: "",
    category: "Subscription"
  });

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/subscriptions`, {
        withCredentials: true
      });
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (subData) => {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/subscriptions`, subData, {
        withCredentials: true
      });
    },
    onSuccess: () => {
      toast.success("Subscription added!");
      setNewSub({ name: "", amount: "", frequency: "Monthly", nextPaymentDate: "", category: "Subscription" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: () => toast.error("Failed to add subscription.")
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/subscriptions/${id}/toggle`, {}, {
        withCredentials: true
      });
    },
    onSuccess: () => {
      toast.success("Subscription status updated!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: () => toast.error("Failed to update status.")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/v1/subscriptions/${id}`, {
        withCredentials: true
      });
    },
    onSuccess: () => {
      toast.success("Subscription deleted!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: () => toast.error("Failed to delete subscription.")
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(newSub);
  };

  const calculateMonthlyCost = () => {
    return subscriptions
      .filter(sub => sub.isActive)
      .reduce((total, sub) => {
        let monthlyEquiv = sub.amount;
        if (sub.frequency === "Yearly") monthlyEquiv = sub.amount / 12;
        if (sub.frequency === "Weekly") monthlyEquiv = sub.amount * 4.33;
        return total + monthlyEquiv;
      }, 0);
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-6 pb-10">
        <h2 className="text-2xl font-bold mb-4 animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-64 rounded"></h2>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 pb-10">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
            <CreditCard className="text-indigo-500" /> Subscriptions Manager
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your recurring payments, bills, and subscriptions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">Monthly Cost</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {formatAmount(calculateMonthlyCost())}
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} /> {showForm ? "Cancel" : "Add New"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
            <input
              type="text"
              required
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newSub.name}
              onChange={e => setNewSub({...newSub, name: e.target.value})}
              placeholder="e.g. Netflix"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Amount</label>
            <input
              type="number"
              required
              min="1"
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newSub.amount}
              onChange={e => setNewSub({...newSub, amount: e.target.value})}
              placeholder="15.99"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Frequency</label>
            <select
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newSub.frequency}
              onChange={e => setNewSub({...newSub, frequency: e.target.value})}
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Next Payment Date</label>
            <input
              type="date"
              required
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newSub.nextPaymentDate}
              onChange={e => setNewSub({...newSub, nextPaymentDate: e.target.value})}
            />
          </div>
          <div className="lg:col-span-4 flex justify-end mt-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Save Subscription
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Subscriptions Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Keep track of your recurring bills by adding your first subscription above.
            </p>
          </div>
        ) : (
          subscriptions.map(sub => {
            const isDueSoon = new Date(sub.nextPaymentDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
            
            return (
              <div key={sub._id} className={`border p-5 rounded-xl transition-all relative group
                ${sub.isActive 
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md' 
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-75'}`}
              >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button 
                    onClick={() => toggleMutation.mutate(sub._id)}
                    className={`p-1.5 rounded-md transition-colors ${sub.isActive ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50' : 'text-gray-500 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400'}`}
                    title={sub.isActive ? "Deactivate" : "Activate"}
                  >
                    <Power size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to delete this?')) {
                        deleteMutation.mutate(sub._id)
                      }
                    }}
                    className="p-1.5 rounded-md text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="flex flex-col h-full justify-between mt-2">
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${!sub.isActive && 'line-through text-gray-500'}`}>
                      {sub.name}
                    </h3>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatAmount(sub.amount)}
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
                        / {sub.frequency.toLowerCase().replace('ly', '')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className={isDueSoon && sub.isActive ? "text-amber-500" : "text-gray-400"} />
                      <span className={isDueSoon && sub.isActive ? "text-amber-600 dark:text-amber-400 font-medium" : "text-gray-500 dark:text-gray-400"}>
                        {sub.isActive ? (
                          <>Next payment: {new Date(sub.nextPaymentDate).toLocaleDateString()}</>
                        ) : (
                          "Paused"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

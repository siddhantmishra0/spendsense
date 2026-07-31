import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, PieChart, TrendingUp, DollarSign } from "lucide-react";
import { Pie } from "react-chartjs-2";
import toast from "react-hot-toast";
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

export default function NetWorth() {
  const { formatAmount } = useCurrencyFormatter();
  const queryClient = useQueryClient();

  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [newAsset, setNewAsset] = useState({ name: "", value: "", category: "Cash" });
  const [newLiability, setNewLiability] = useState({ name: "", value: "", category: "Loan" });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        withCredentials: true,
      });
      return res.data.user;
    },
  });

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["networth_history", user?._id],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/networth?userId=${user._id}`,
        { withCredentials: true }
      );
      return res.data;
    },
    enabled: !!user?._id,
  });

  useEffect(() => {
    if (history.length > 0) {
      const latest = history[history.length - 1];
      setAssets(latest.assets || []);
      setLiabilities(latest.liabilities || []);
    }
  }, [history]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/networth`,
        payload,
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["networth_history"]);
      toast.success("Net worth updated!");
    },
    onError: () => {
      toast.error("Failed to update net worth");
    }
  });

  const handleSave = () => {
    if (!user) return;
    updateMutation.mutate({
      userId: user._id,
      assets,
      liabilities
    });
  };

  const addAsset = () => {
    if (!newAsset.name || !newAsset.value) return;
    setAssets([...assets, { ...newAsset, value: Number(newAsset.value) }]);
    setNewAsset({ name: "", value: "", category: "Cash" });
  };

  const removeAsset = (index) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const addLiability = () => {
    if (!newLiability.name || !newLiability.value) return;
    setLiabilities([...liabilities, { ...newLiability, value: Number(newLiability.value) }]);
    setNewLiability({ name: "", value: "", category: "Loan" });
  };

  const removeLiability = (index) => {
    setLiabilities(liabilities.filter((_, i) => i !== index));
  };

  const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + curr.value, 0);
  const totalNetWorth = totalAssets - totalLiabilities;

  const chartData = {
    labels: ["Assets", "Liabilities"],
    datasets: [{
      data: [totalAssets, totalLiabilities],
      backgroundColor: ["#10B981", "#EF4444"],
      borderWidth: 0,
    }]
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading your wealth data...</div>;
  }

  return (
    <div className="w-full px-4 md:px-6 pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Net Worth Tracker</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your assets and liabilities over time.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="mt-4 md:mt-0 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          {updateMutation.isPending ? "Saving..." : "Save Current Snapshot"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-4">
            <PieChart size={36} />
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Net Worth</h3>
          <div className={`text-4xl font-bold mt-2 ${totalNetWorth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {formatAmount(totalNetWorth)}
          </div>
          <div className="w-48 h-48 mt-6">
            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <TrendingUp size={20} /> Assets
              </h3>
              <span className="font-bold text-gray-800 dark:text-white">{formatAmount(totalAssets)}</span>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                className="flex-1 border dark:border-gray-600 rounded-md p-2 text-sm dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Value"
                value={newAsset.value}
                onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                className="w-24 border dark:border-gray-600 rounded-md p-2 text-sm dark:bg-gray-700"
              />
              <button onClick={addAsset} className="bg-emerald-500 text-white p-2 rounded-md hover:bg-emerald-600">
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {assets.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-medium text-sm">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">{formatAmount(item.value)}</span>
                    <button onClick={() => removeAsset(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liabilities Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <DollarSign size={20} /> Liabilities
              </h3>
              <span className="font-bold text-gray-800 dark:text-white">{formatAmount(totalLiabilities)}</span>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={newLiability.name}
                onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                className="flex-1 border dark:border-gray-600 rounded-md p-2 text-sm dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Value"
                value={newLiability.value}
                onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })}
                className="w-24 border dark:border-gray-600 rounded-md p-2 text-sm dark:bg-gray-700"
              />
              <button onClick={addLiability} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600">
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {liabilities.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-medium text-sm">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-red-600 dark:text-red-400 font-medium text-sm">{formatAmount(item.value)}</span>
                    <button onClick={() => removeLiability(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

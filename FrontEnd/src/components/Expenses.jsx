import React, { useState, useRef } from "react";
import { Trash, Sparkles, Loader2, Camera, Upload, Mic } from "lucide-react";
import toast from "react-hot-toast";
import Tesseract from "tesseract.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

function Expenses() {
  const queryClient = useQueryClient();
  const { formatAmount } = useCurrencyFormatter();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Food");
  const [tags, setTags] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  const handleScanReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress("Reading image...");
    
    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => {
          if (m.status === 'recognizing text') {
            setScanProgress(`Scanning: ${Math.round(m.progress * 100)}%`);
          }
        }}
      );
      
      setScanProgress("AI Parsing...");
      
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/ai/receipt`, { text }, { withCredentials: true });
      const { merchantName, amount: parsedAmount, date: parsedDate } = res.data;
      
      if (merchantName) setDescription(merchantName);
      if (parsedAmount) setAmount(parsedAmount);
      if (parsedDate) setDate(parsedDate);
      
      toast.success("Receipt scanned successfully!");
    } catch (err) {
      console.error("OCR Error", err);
      toast.error("Failed to scan receipt");
    } finally {
      setIsScanning(false);
      setScanProgress("");
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingCSV(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          const mappedExpenses = rows.map(row => {
            const description = row.Description || row.description || row.Name || row.name || "Imported Expense";
            const amount = row.Amount || row.amount || row.Cost || row.cost || "0";
            const date = row.Date || row.date || new Date().toISOString();
            const category = row.Category || row.category || "Other";
            return { description, amount: Math.abs(Number(amount)), date, category, tags: [] };
          });
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/home/expense/bulk`, { expenses: mappedExpenses, userId }, { withCredentials: true });
          toast.success("Expenses imported successfully!");
          queryClient.invalidateQueries({ queryKey: ["expenses", userId] });
        } catch (err) {
          toast.error("Failed to import CSV");
        } finally {
          setIsUploadingCSV(false);
          if (csvInputRef.current) csvInputRef.current.value = null;
        }
      }
    });
  };

  const handleVoiceEntry = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening... Describe your expense!", { icon: '🎙️' });
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      toast.success(`Heard: "${speechResult}"`);
      
      const parsedAmount = speechResult.match(/\d+(\.\d{1,2})?/);
      if (parsedAmount) setAmount(parsedAmount[0]);
      
      const textWithoutAmount = speechResult.replace(/\d+(\.\d{1,2})?/, '').replace(/dollars?|rupees?|bucks?/ig, '').trim();
      setDescription(textWithoutAmount || speechResult);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
      toast.error("Voice recognition failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleAutoCategorize = async () => {
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }
    setIsCategorizing(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/ai/categorize`, {
        description
      }, { withCredentials: true });
      if (res.data.category) {
        setCategory(res.data.category);
        toast.success(`Categorized as ${res.data.category}`);
        setBudgetError("");
      }
    } catch (error) {
      console.error("Categorize error:", error);
      toast.error("Failed to auto-categorize");
    } finally {
      setIsCategorizing(false);
    }
  };

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        withCredentials: true,
      });
      return response.data.user;
    },
    onError: () => window.location.href = "/"
  });
  const userId = user?._id;

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses", userId],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/home/expense?userId=${userId}`, {
        withCredentials: true,
      });
      return res.data;
    },
    enabled: !!userId,
  });

  const { data: budget = [] } = useQuery({
    queryKey: ["budgets", userId],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/home/budget?userId=${userId}`, {
        withCredentials: true,
      });
      return res.data;
    },
    enabled: !!userId,
  });

  const getTotalSpentForCategory = (categoryName) => {
    return expenses
      .filter((expense) => expense.category === categoryName)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getBudgetForCategory = (categoryName) => {
    const categoryBudget = budget.find((b) => b.category === categoryName);
    return categoryBudget ? categoryBudget.amount : 0;
  };

  const validateBudget = (categoryName, expenseAmount) => {
    const currentSpent = getTotalSpentForCategory(categoryName);
    const budgetLimit = getBudgetForCategory(categoryName);
    const newTotal = currentSpent + expenseAmount;

    if (budgetLimit === 0) {
      return {
        isValid: false,
        message: `No budget set for ${categoryName} category. Please set a budget first.`,
      };
    }

    if (newTotal > budgetLimit) {
      const remaining = budgetLimit - currentSpent;
      return {
        isValid: false,
        message: `This expense would exceed your ${categoryName} budget. Budget: ${formatAmount(budgetLimit)}, Already spent: ${formatAmount(currentSpent)}, Remaining: ${formatAmount(remaining)}`,
      };
    }

    return { isValid: true, message: "" };
  };

  const addExpenseMutation = useMutation({
    mutationFn: async (expenseData) => {
      return await axios.post(`${import.meta.env.VITE_API_BASE_URL}/home/expense`, expenseData, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", userId] });
      queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
      setDescription("");
      setAmount("");
      setDate("");
      setCategory("Food");
      setTags("");
      setBudgetError("");
    },
    onError: (error) => {
      console.log("Error while posting expense ", error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setBudgetError("");
    const expenseAmount = parseFloat(amount);
    const validation = validateBudget(category, expenseAmount);

    if (!validation.isValid) {
      setBudgetError(validation.message);
      return;
    }

    addExpenseMutation.mutate({
      description,
      amount: expenseAmount,
      date,
      category,
      tags: tags.split(",").map((tag) => tag.trim()),
      userId,
      budget,
    });
  };

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id) => {
      return await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/home/expense/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", userId] });
      queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
    },
    onError: (error) => {
      console.log("Error in deleting expense ", error);
    }
  });

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense? ");
    if (!confirmDelete) return;
    deleteExpenseMutation.mutate(id);
  };

  const getRemainingBudget = () => {
    if (!category) return 0;
    const spent = getTotalSpentForCategory(category);
    const budgetLimit = getBudgetForCategory(category);
    return Math.max(0, budgetLimit - spent);
  };

  return (
    <div className="w-full">
      <div className="border w-full p-4 rounded-md mb-6 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="font-semibold text-xl md:text-2xl">
            Add New Expense
          </h2>
          <div className="flex flex-wrap gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleScanReceipt} 
            />
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={csvInputRef} 
              onChange={handleCSVUpload} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning || isUploadingCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              {isScanning ? scanProgress : "Scan Receipt"}
            </button>
            <button
              onClick={() => csvInputRef.current?.click()}
              disabled={isScanning || isUploadingCSV || isListening}
              className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isUploadingCSV ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {isUploadingCSV ? "Importing..." : "CSV"}
            </button>
            <button
              onClick={handleVoiceEntry}
              disabled={isScanning || isUploadingCSV || isListening}
              className={`flex items-center gap-2 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-orange-500'} text-white px-3 py-1.5 rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-50`}
            >
              <Mic size={16} />
              {isListening ? "Listening..." : "Voice"}
            </button>
          </div>
        </div>

        {/* Budget Information */}
        {category && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>{category} Budget:</strong> {formatAmount(getBudgetForCategory(category))} |<strong> Spent:</strong> {formatAmount(getTotalSpentForCategory(category))} |<strong> Remaining:</strong>{" "}
              {formatAmount(getRemainingBudget())}
            </p>
          </div>
        )}

        {/* Budget Error Message */}
        {budgetError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{budgetError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* First row of inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="description" className="block mb-1 font-medium">
                Description
              </label>
              <input
                type="text"
                id="description"
                className="border rounded-md p-2 w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block mb-1 font-medium">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                className="border rounded-md p-2 w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Second row of inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date" className="block mb-1 font-medium">
                Date
              </label>
              <input
                type="date"
                id="date"
                className="border rounded-md p-2 w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="category" className="block font-medium">
                  Category
                </label>
                <button
                  type="button"
                  onClick={handleAutoCategorize}
                  disabled={isCategorizing || !description}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                >
                  {isCategorizing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  Auto-categorize
                </button>
              </div>
              <select
                id="category"
                className="border rounded-md p-2 w-full"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setBudgetError(""); // Clear error when category changes
                }}
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
                <option value="Bills">Bills</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
              </select>
            </div>
          </div>

          {/* Tags input */}
          <div className="mb-4">
            <label htmlFor="tags" className="block mb-1 font-medium">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              placeholder="e.g. groceries, monthly, essential"
              className="border rounded-md p-2 w-full"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>

      {/* Expenses List */}
      <div className="border-2 rounded-md p-4 shadow-md">
        <h2 className="font-semibold text-xl md:text-2xl mb-4">
          Your Expenses
        </h2>

        {expenses.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300 text-center py-4">
            No expenses added yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left hidden sm:table-cell">Date</th>
                  <th className="p-2 text-left hidden md:table-cell">
                    Category
                  </th>
                  <th className="p-2 text-left hidden lg:table-cell">Tags</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id} className="border-b">
                    <td className="p-2">{expense.description}</td>
                    <td className="p-2">{formatAmount(expense.amount)}</td>
                    <td className="p-2 hidden sm:table-cell">
                      {new Date(expense.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-2 hidden md:table-cell">
                      {expense.category}
                    </td>
                    <td className="p-2 hidden lg:table-cell">
                      {expense.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-sm mr-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(expense._id)}
                      >
                        <Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Expenses;

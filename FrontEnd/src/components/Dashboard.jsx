import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  TrendingDown,
  Wallet,
  Activity,
  CreditCard,
  HeartPulse
} from "lucide-react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from "chart.js";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Helper for skeleton loaders
const SkeletonCard = () => (
  <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800 animate-pulse flex flex-col justify-between h-40">
    <div className="flex flex-row items-center justify-between mb-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
    </div>
    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full w-full"></div>
  </div>
);

function Dashboard() {
  const { formatAmount } = useCurrencyFormatter();
  
  // Responsive Chart Options
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch User
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        withCredentials: true,
      });
      return res.data.user;
    },
  });

  // Fetch Expenses
  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ["dashboard_expenses"],
    queryFn: async () => {
      const userIdStr = user?._id ? `?userId=${user._id}` : "";
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/home/expense${userIdStr}`, {
        withCredentials: true,
      });
      return res.data;
    },
    enabled: !!user?._id
  });

  // Fetch Budget
  const { data: budget = [], isLoading: loadingBudget } = useQuery({
    queryKey: ["dashboard_budget"],
    queryFn: async () => {
      const userIdStr = user?._id ? `?userId=${user._id}` : "";
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/home/budget${userIdStr}`, {
        withCredentials: true,
      });
      return res.data;
    },
    enabled: !!user?._id
  });

  // Fetch Health Score
  const { data: healthScore, isLoading: loadingHealth } = useQuery({
    queryKey: ["dashboard_health", user?._id],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/health?userId=${user._id}`, {
        withCredentials: true,
      });
      return res.data.score;
    },
    enabled: !!user?._id
  });

  const isLoading = loadingExpenses || loadingBudget || loadingHealth;

  // Calculate total expenses
  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Calculate current month expenses
  const getCurrentMonthExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  // Calculate total budget
  const getTotalBudget = () => {
    if (budget.length > 0) {
      const overallBudget = budget.find(
        (budgetItem) => budgetItem.category === "Overall"
      );
      return overallBudget ? overallBudget.amount : 0;
    }
    return 0;
  };

  // Calculate remaining budget
  const getRemainingBudget = () => {
    const totalBudget = getTotalBudget();
    const totalExpenses = getCurrentMonthExpenses(); // Usually remaining budget is for the month
    return totalBudget - totalExpenses;
  };

  // Calculate budget percentage
  const getBudgetPercentage = () => {
    const totalBudget = getTotalBudget();
    const totalExpenses = getCurrentMonthExpenses();
    if (totalBudget === 0) return 0;
    return (totalExpenses / totalBudget) * 100;
  };

  // Check if over budget
  const isOverBudget = getRemainingBudget() <= 0;
  const budgetPercentage = getBudgetPercentage();

  // Generate category data for pie chart
  const getCategoryData = () => {
    const categoryTotals = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter expenses for current month
    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    currentMonthExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const colors = [
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 206, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(153, 102, 255, 0.8)",
      "rgba(255, 159, 64, 0.8)",
      "rgba(199, 199, 199, 0.8)",
      "rgba(83, 102, 255, 0.8)",
    ];

    return {
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [
        {
          label: "Expenses by Category",
          data: data.length > 0 ? data : [1],
          backgroundColor: colors.slice(0, labels.length > 0 ? labels.length : 1),
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          hoverOffset: 4,
        },
      ],
    };
  };

  // Generate monthly trend data
  const getMonthlyData = () => {
    const monthlyTotals = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    months.forEach((month, index) => {
      monthlyTotals[index] = 0;
    });

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === currentYear) {
        const month = expenseDate.getMonth();
        monthlyTotals[month] += expense.amount;
      }
    });

    const currentMonth = new Date().getMonth();
    const last6Months = [];
    const last6MonthsData = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
      last6MonthsData.push(monthlyTotals[monthIndex]);
    }

    // Determine if it's dark mode by looking at the document root
    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
    const textColor = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";

    return {
      labels: last6Months,
      datasets: [
        {
          label: "Monthly Expenses",
          data: last6MonthsData,
          fill: true,
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderColor: "rgba(99, 102, 241, 1)",
          tension: 0.4,
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(99, 102, 241, 1)",
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: windowWidth < 768 ? "bottom" : "top",
        labels: {
          color: document.documentElement.classList.contains("dark") ? "#9CA3AF" : "#4B5563",
          font: {
            family: "'Inter', sans-serif",
            size: windowWidth < 768 ? 10 : 12,
          },
        },
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains("dark") ? "rgba(17, 24, 39, 0.9)" : "rgba(255, 255, 255, 0.9)",
        titleColor: document.documentElement.classList.contains("dark") ? "#F3F4F6" : "#111827",
        bodyColor: document.documentElement.classList.contains("dark") ? "#D1D5DB" : "#4B5563",
        borderColor: document.documentElement.classList.contains("dark") ? "#374151" : "#E5E7EB",
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: {
          color: document.documentElement.classList.contains("dark") ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          display: true,
        },
        ticks: {
          color: document.documentElement.classList.contains("dark") ? "#9CA3AF" : "#6B7280",
        }
      },
      y: {
        grid: {
          color: document.documentElement.classList.contains("dark") ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          display: true,
          borderDash: [5, 5],
        },
        ticks: {
          color: document.documentElement.classList.contains("dark") ? "#9CA3AF" : "#6B7280",
          callback: function(value) {
            return value; // Can format string here later if needed
          }
        }
      }
    }
  };

  const statCards = [
    {
      title: "All-time Expenses",
      value: formatAmount(getTotalExpenses()),
      description: "Since account creation",
      symbol: <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Activity size={20} /></div>,
    },
    {
      title: "Financial Health",
      value: healthScore !== undefined ? `${healthScore}/100` : "...",
      description: "Based on spending habits",
      symbol: <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg"><HeartPulse size={20} /></div>,
      bar: (
        <div className="mt-3 h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${healthScore > 75 ? "bg-emerald-500" : healthScore > 40 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${healthScore || 0}%` }}
          />
        </div>
      ),
    },
    {
      title: "Monthly Expenses",
      value: formatAmount(getCurrentMonthExpenses()),
      description: "Current month spending",
      symbol: <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Calendar size={20} /></div>,
    },
    {
      title: "Monthly Budget",
      value: formatAmount(getTotalBudget()),
      description: "Target Spending Limit",
      symbol: <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><Wallet size={20} /></div>,
    },
    {
      title: "Remaining Budget",
      value: (
        <div className={isOverBudget ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
          {formatAmount(Math.abs(getRemainingBudget()))}
        </div>
      ),
      description: (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isOverBudget ? "Over budget by this amount" : `${budgetPercentage.toFixed(0)}% of budget utilized`}
        </span>
      ),
      symbol: isOverBudget ? (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><TrendingDown size={20} /></div>
      ) : (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><TrendingUp size={20} /></div>
      ),
      bar: (
        <div className="mt-3 h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${isOverBudget ? "bg-red-500" : budgetPercentage > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-6 pb-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
          <p className="text-gray-500 dark:text-gray-400">Loading your financial insights...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl bg-white dark:bg-gray-800 h-80 animate-pulse"></div>
          <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl bg-white dark:bg-gray-800 h-80 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 pb-10">
      
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening with your finances today.
          </p>
        </div>
      </div>

      {/* Stat Cards - Grid layout for better responsiveness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-44 relative overflow-hidden"
          >
            <div className="flex flex-row items-center justify-between mb-2">
              <div className="font-medium text-gray-600 dark:text-gray-300 text-sm">
                {card.title}
              </div>
              <div>{card.symbol}</div>
            </div>
            <div>
              <div className="font-bold text-2xl text-gray-900 dark:text-white mb-1">{card.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{card.description}</div>
              {card.bar}
            </div>
          </div>
        ))}
      </div>

      {/* Charts - Responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Expense Trend</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your spending over the last 6 months</p>
          </div>
          <div className="h-64 md:h-72 w-full relative">
            <Line data={getMonthlyData()} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: { display: false }}}} />
          </div>
        </div>

        {/* Expense Categories Chart */}
        <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Category Breakdown</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current month's expenses</p>
          </div>
          <div className="flex-1 min-h-[250px] relative flex items-center justify-center">
            {expenses.length > 0 ? (
              <Pie data={getCategoryData()} options={{...chartOptions, maintainAspectRatio: false}} />
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-500 text-sm">No expenses this month</div>
            )}
          </div>
        </div>
      </div>

      {/* No Data Messages */}
      {expenses.length === 0 && !isLoading && (
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-full">
            <CreditCard size={18} />
          </div>
          <p className="text-indigo-700 dark:text-indigo-300 text-sm">
            No expenses recorded yet. Start adding expenses to unlock full dashboard insights!
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

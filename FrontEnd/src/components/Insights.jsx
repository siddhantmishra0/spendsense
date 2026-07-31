import React, { useState, useEffect } from "react";
import {
  RefreshCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  CircleCheckBig,
  Loader,
} from "lucide-react";
import axios from "axios";
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

function Insights() {
  const { formatAmount } = useCurrencyFormatter();
  const [buttonType, setButtonType] = useState("Recommendations");
  const [userId, setUserId] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [insights, setInsights] = useState(null);
  const [spendingAnomalies, setSpendingAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({
    totalSpending: 0,
    topCategory: { name: "N/A", amount: 0, percentage: 0 },
    savingsPotential: 0,
    changeFromLastMonth: { amount: 0, percentage: 0, isPositive: false },
  });

  // Fetch user ID
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        withCredentials: true,
      })
      .then((response) => setUserId(response.data.user._id))
      .catch((error) => {
        console.log("Fetch error: ", error);
        window.location.href = "/";
      });
    }, []);

  // Fetch expenses when userId changes
  useEffect(() => {
    if (userId) {
      fetchExpenses();
    }
  }, [userId]);

  // Generate insights when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      calculateMonthlyStats();
      generateInsights();
      detectSpendingAnomalies();
    }
  }, [expenses]);

  const fetchExpenses = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/home/expense?userId=${userId}`,
        { withCredentials: true }
      );
      setExpenses(res.data);
    } catch (error) {
      console.log("Error while fetching expenses ", error);
    }
  };

  const calculateMonthlyStats = () => {
    const currentMonth = new Date();
    const currentMonthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const currentMonthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const lastMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0
    );

    // Current month expenses
    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
    });

    // Last month expenses
    const lastMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      return expenseDate >= lastMonth && expenseDate <= lastMonthEnd;
    });

    const currentTotal = currentMonthExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );
    const lastMonthTotal = lastMonthExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );

    // Category analysis
    const categoryTotals = {};
    currentMonthExpenses.forEach((expense) => {
      const category = expense.category || "Other";
      categoryTotals[category] =
        (categoryTotals[category] || 0) + (expense.amount || 0);
    });

    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [cat, amount]) =>
        amount > max.amount ? { name: cat, amount } : max,
      { name: "N/A", amount: 0 }
    );

    // Calculate change from last month
    const changeAmount = currentTotal - lastMonthTotal;
    const changePercentage =
      lastMonthTotal > 0 ? (changeAmount / lastMonthTotal) * 100 : 0;

    setMonthlyStats({
      totalSpending: currentTotal,
      topCategory: {
        ...topCategory,
        percentage:
          currentTotal > 0 ? (topCategory.amount / currentTotal) * 100 : 0,
      },
      savingsPotential: 0, 
      changeFromLastMonth: {
        amount: Math.abs(changeAmount),
        percentage: Math.abs(changePercentage),
        isPositive: changeAmount < 0, // Negative change is positive (spent less)
      },
    });
  };

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Prepare expense data for analysis
      const expenseData = prepareExpenseDataForAnalysis();

      // Generate insights based on spending patterns
      const analysisResponse = await analyzeSpendingPatterns(expenseData);

      setInsights(analysisResponse.recommendations);

      // Update savings potential from analysis
      setMonthlyStats((prev) => ({
        ...prev,
        savingsPotential: analysisResponse.totalSavingsPotential || 0,
      }));
    } catch (error) {
      console.error("Error generating insights:", error);
      // Fallback to rule-based insights
      setInsights(generateRuleBasedInsights());
    } finally {
      setLoading(false);
    }
  };

  const prepareExpenseDataForAnalysis = () => {
    const currentMonth = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentMonth.getMonth() - 3);

    const recentExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      return expenseDate >= threeMonthsAgo;
    });

    // Group by category and month
    const categoryAnalysis = {};
    const monthlyTrends = {};

    recentExpenses.forEach((expense) => {
      const category = expense.category || "Other";
      const month = new Date(expense.date || expense.createdAt)
        .toISOString()
        .slice(0, 7);

      // Category totals
      categoryAnalysis[category] =
        (categoryAnalysis[category] || 0) + expense.amount;

      // Monthly trends
      if (!monthlyTrends[month]) monthlyTrends[month] = {};
      monthlyTrends[month][category] =
        (monthlyTrends[month][category] || 0) + expense.amount;
    });

    return {
      categoryAnalysis,
      monthlyTrends,
      totalExpenses: recentExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      expenseCount: recentExpenses.length,
      averageTransaction:
        recentExpenses.length > 0
          ? recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) /
            recentExpenses.length
          : 0,
    };
  };

  // Analyze spending patterns and generate recommendations
  const analyzeSpendingPatterns = async (expenseData) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/ai/insights`, {
        userId
      }, { withCredentials: true });
      
      const groqResponse = res.data;
      
      // format potential as currency string if it is a number
      if (groqResponse && groqResponse.recommendations) {
        groqResponse.recommendations = groqResponse.recommendations.map(rec => ({
          ...rec,
          potential: formatAmount(rec.potential)
        }));
      }

      return groqResponse;
    } catch (error) {
      console.error("Error fetching AI insights from backend:", error);
      throw error; // Let generateInsights handle the fallback
    }
  };

  const generateRuleBasedInsights = () => {
    // Fallback insights when analysis is not available
    return [
      {
        title: "Monitor your largest expense category",
        impact: "High Impact",
        subtitle:
          "Focus on your biggest spending category for maximum savings potential.",
        potential: formatAmount(50),
      },
      {
        title: "Set weekly spending limits",
        impact: "Medium Impact",
        subtitle:
          "Create weekly budgets for discretionary spending to avoid overspending.",
        potential: formatAmount(75),
      },
    ];
  };

  const detectSpendingAnomalies = () => {
    const anomalies = [];

    // Analyze spending patterns for unusual activity
    const currentMonth = new Date();
    const currentMonthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const currentMonthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    // Get current month expenses by category
    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
    });

    // Calculate averages from previous 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentMonth.getMonth() - 3);
    threeMonthsAgo.setDate(1);

    const historicalExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      return expenseDate >= threeMonthsAgo && expenseDate < currentMonthStart;
    });

    // Group by category
    const currentCategories = {};
    const historicalCategories = {};

    currentMonthExpenses.forEach((expense) => {
      const category = expense.category || "Other";
      currentCategories[category] =
        (currentCategories[category] || 0) + expense.amount;
    });

    historicalExpenses.forEach((expense) => {
      const category = expense.category || "Other";
      historicalCategories[category] =
        (historicalCategories[category] || 0) + expense.amount;
    });

    // Calculate monthly averages for historical data
    Object.keys(historicalCategories).forEach((category) => {
      historicalCategories[category] = historicalCategories[category] / 3; // 3 months average
    });

    // Detect anomalies (>30% increase)
    Object.entries(currentCategories).forEach(([category, currentAmount]) => {
      const historicalAverage = historicalCategories[category] || 0;
      if (historicalAverage > 0) {
        const percentageChange =
          ((currentAmount - historicalAverage) / historicalAverage) * 100;
        if (percentageChange > 30) {
          anomalies.push({
            logo: "attention",
            title: category,
            subtitle: `Unusual spending increase of ${percentageChange.toFixed(
              1
            )}% compared to your 3-month average`,
            anomalies: formatAmount(currentAmount - historicalAverage),
          });
        }
      }
    });

    // Check for new categories (could indicate new subscriptions)
    Object.keys(currentCategories).forEach((category) => {
      if (!historicalCategories[category] && currentCategories[category] > 10) {
        anomalies.push({
          logo: "correct",
          title: category,
          subtitle: `New spending category detected this month`,
          anomalies: formatAmount(currentCategories[category]),
        });
      }
    });

    setSpendingAnomalies(anomalies);
  };

  const refreshInsights = () => {
    if (expenses.length > 0) {
      generateInsights();
      detectSpendingAnomalies();
    }
  };

  const RenderInsights = () => {
    switch (buttonType) {
      case "Recommendations":
        if (loading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin mr-2" />
              <span>Analyzing your spending patterns...</span>
            </div>
          );
        }
        return (
          <>
            {insights && insights.length > 0 ? (
              insights.map((recommendation, index) => (
                <Recommendations
                  key={index}
                  title={recommendation.title}
                  impact={recommendation.impact}
                  subtitle={recommendation.subtitle}
                  potential={`${recommendation.potential}/month`}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                No recommendations available. Add more expenses to get
                personalized insights.
              </div>
            )}
          </>
        );
      case "Spending":
        return (
          <>
            {spendingAnomalies.length > 0 ? (
              spendingAnomalies.map((anomaly, index) => (
                <Spending
                  key={index}
                  logo={anomaly.logo}
                  title={anomaly.title}
                  subtitle={anomaly.subtitle}
                  anomalies={anomaly.anomalies}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                No unusual spending patterns detected. Your spending looks
                normal!
              </div>
            )}
          </>
        );
    }
  };

  const RenderLogo = ({ logo }) => {
    switch (logo) {
      case "attention":
        return (
          <div className="text-red-500">
            <TriangleAlert />
          </div>
        );
      case "correct":
        return (
          <div className="text-green-500">
            <CircleCheckBig />
          </div>
        );
    }
  };

  const RenderImpact = ({ type }) => {
    switch (type) {
      case "High Impact":
        return (
          <div className="text-white text-xs font-semibold pl-4 pr-4 rounded-xl flex items-center bg-green-500">
            {type}
          </div>
        );
      case "Low Impact":
        return (
          <div className="text-white text-xs font-semibold pl-4 pr-4 rounded-xl flex items-center bg-blue-500">
            {type}
          </div>
        );
      case "Medium Impact":
        return (
          <div className="text-white text-xs font-semibold pl-4 pr-4 rounded-xl flex items-center bg-yellow-500">
            {type}
          </div>
        );
    }
  };

  function Recommendations(props) {
    return (
      <div className="border rounded-md mt-6">
        <div className="m-6">
          <div className="flex justify-between ">
            <div className="font-semibold text-lg">{props.title}</div>
            <RenderImpact type={props.impact} />
          </div>
          <div className="text-gray-500 dark:text-gray-300 mt-2 mb-4">{props.subtitle}</div>
        </div>
        <hr />
        <div className="m-6">
          <div className="flex justify-between">
            <div className="text-gray-500 dark:text-gray-300 text-sm">Potential Savings</div>
            <div className="text-green-500 font-semibold text-lg">
              {props.potential}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Spending(props) {
    return (
      <div className="border rounded-md mt-6">
        <div className="m-6">
          <div className="flex justify-between ">
            <div className="flex gap-2 items-center">
              <RenderLogo logo={props.logo} />
              <div className="font-bold text-lg">{props.title}</div>
            </div>
            <div className="font-semibold text-lg">{props.anomalies}</div>
          </div>
          <div className="text-gray-500 dark:text-gray-300 mt-2 mb-4">{props.subtitle}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-4">
      <div className="flex justify-between items-center ">
        <div>
          <div className="flex gap-2 items-center">
            <Sparkles />
            <div className="text-3xl font-bold">Financial Insights</div>
          </div>
          <div className="text-gray-500 dark:text-gray-300">
            Personalized recommendations based on your spending patterns
          </div>
        </div>
        <button
          className="border rounded-md p-2 pl-4 pr-4 flex gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 disabled:opacity-50"
          onClick={refreshInsights}
          disabled={loading}
        >
          <div>
            <RefreshCcw className={loading ? "animate-spin" : ""} />
          </div>
          <div>{loading ? "Analyzing..." : "Refresh Insights"}</div>
        </button>
      </div>

      <div className="border rounded-md p-4 mt-4">
        <div className="text-2xl font-bold">Monthly Summary</div>
        <div className="text-gray-500 dark:text-gray-300">Overview of your financial health</div>
        <div className="grid grid-cols-3 mt-4">
          <div>
            <div className="text-gray-500 dark:text-gray-300 font-semibold text-sm">
              Monthly Spending
            </div>
            <div className="font-bold text-3xl">
              {formatAmount(monthlyStats.totalSpending)}
            </div>
            <div
              className={`flex items-center ${
                monthlyStats.changeFromLastMonth.isPositive
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {monthlyStats.changeFromLastMonth.isPositive ? (
                <TrendingDown />
              ) : (
                <TrendingUp />
              )}
              {monthlyStats.changeFromLastMonth.percentage.toFixed(1)}%{" "}
              {monthlyStats.changeFromLastMonth.isPositive ? "lower" : "higher"}{" "}
              than last month
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-300">
              Top spending Category
            </div>
            <div className="font-bold text-3xl">
              {monthlyStats.topCategory.name}
            </div>
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-300">
              {formatAmount(monthlyStats.topCategory.amount)} (
              {monthlyStats.topCategory.percentage.toFixed(1)}% of total)
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-300">
              Savings Potential
            </div>
            <div className="text-green-500 font-bold text-3xl">
              {formatAmount(monthlyStats.savingsPotential)}
            </div>
            <div className="text-gray-500 dark:text-gray-300">
              Potential monthly savings based on our recommendations
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 w-full rounded-md mt-6 bg-gray-100 dark:bg-gray-800">
        <button
          value="Recommendations"
          className={`rounded-md py-2 px-1 md:px-2 m-1 text-sm md:text-base ${
            buttonType === "Recommendations" ? "bg-white dark:bg-gray-800" : "text-gray-500 dark:text-gray-300"
          }`}
          onClick={(e) => setButtonType(e.target.value)}
        >
          Recommendations
        </button>
        <button
          value="Spending"
          className={`rounded-md py-2 px-1 md:px-2 m-1 text-sm md:text-base ${
            buttonType === "Spending" ? "bg-white dark:bg-gray-800" : "text-gray-500 dark:text-gray-300"
          }`}
          onClick={(e) => setButtonType(e.target.value)}
        >
          Spending Anomalies
        </button>
      </div>
      <div>{RenderInsights()}</div>
    </div>
  );
}

export default Insights;

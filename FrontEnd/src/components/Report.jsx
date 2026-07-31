import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Report(props) {
  const { formatAmount } = useCurrencyFormatter();
  const [reportType, setReportType] = React.useState("By category");
  const [loading, setLoading] = React.useState(true);
  const [chartData, setChartData] = React.useState(null);
  const [dateFrom, setDateFrom] = React.useState("2025-01-01");
  const [dateTo, setDateTo] = React.useState("2025-03-31");
  const [buttonType, setButtonType] = useState("Summary");
  const [userId, setUserId] = useState("");
  const [expenses, setExpenses] = useState([]);

  const chartRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);

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

  const exportToCSV = () => {
    const filteredExpenses = filterExpensesByDateRange(expenses, dateFrom, dateTo);
    if (filteredExpenses.length === 0) {
      alert("No data to export for this date range.");
      return;
    }

    const headers = ["Date,Category,Amount,Description\n"];
    const csvData = filteredExpenses.map(exp => {
      const date = new Date(exp.date || exp.createdAt).toLocaleDateString();
      const category = `"${exp.category || "Other"}"`;
      const amount = exp.amount;
      const description = `"${(exp.description || "").replace(/"/g, '""')}"`;
      return `${date},${category},${amount},${description}\n`;
    });

    const blob = new Blob([...headers, ...csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_report_${dateFrom}_to_${dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch (error) {
          console.log("Error destroying chart on cleanup:", error);
        } finally {
          chartInstanceRef.current = null;
        }
      }
    };
  }, []);

  // Fetch data whenever reportType, dateFrom, dateTo, or expenses changes
  useEffect(() => {
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
      } catch (error) {
        console.log("Error destroying chart:", error);
      } finally {
        chartInstanceRef.current = null;
      }
    }
    if (expenses.length > 0) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        processExpenseData();
      }, 100);
    }
  }, [reportType, dateFrom, dateTo, expenses]);

  // Helper function to filter expenses by date range
  const filterExpensesByDateRange = (expenses, fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // Include the entire end date

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      return expenseDate >= from && expenseDate <= to;
    });
  };

  // Helper function to group expenses by category
  const groupExpensesByCategory = (expenses) => {
    const categoryTotals = {};
    expenses.forEach((expense) => {
      const category = expense.category || "Other";
      categoryTotals[category] =
        (categoryTotals[category] || 0) + (expense.amount || 0);
    });
    return categoryTotals;
  };

  // Helper function to group expenses by month
  const groupExpensesByMonth = (expenses) => {
    const monthTotals = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date || expense.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthTotals[monthKey] =
        (monthTotals[monthKey] || 0) + (expense.amount || 0);
    });
    return monthTotals;
  };

  // Helper function to group expenses by week
  const groupExpensesByWeek = (expenses) => {
    const weekTotals = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date || expense.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Get start of week (Sunday)
      const weekKey = weekStart.toISOString().split("T")[0];
      weekTotals[weekKey] = (weekTotals[weekKey] || 0) + (expense.amount || 0);
    });
    return weekTotals;
  };

  const processExpenseData = async () => {
    setLoading(true);
    try {
      // Filter expenses by date range
      const filteredExpenses = filterExpensesByDateRange(
        expenses,
        dateFrom,
        dateTo
      );

      if (reportType === "By category") {
        const categoryData = groupExpensesByCategory(filteredExpenses);
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        const colors = [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(199, 199, 199, 0.5)",
          "rgba(83, 102, 255, 0.5)",
        ];

        const borderColors = colors.map((color) => color.replace("0.5", "1"));

        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Expenses by Category",
              data: data,
              backgroundColor: colors.slice(0, labels.length),
              borderColor: borderColors.slice(0, labels.length),
              borderWidth: 1,
            },
          ],
        });
      } else if (reportType === "Monthly Trend") {
        const monthData = groupExpensesByMonth(filteredExpenses);
        const sortedMonths = Object.keys(monthData).sort();
        const labels = sortedMonths.map((month) => {
          const date = new Date(month + "-01");
          return date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
        });
        const data = sortedMonths.map((month) => monthData[month]);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Monthly Expenses",
              data: data,
              borderColor: "rgb(99, 102, 241)",
              backgroundColor: "rgba(99, 102, 241, 0.5)",
              tension: 0.3,
            },
          ],
        });
      } else if (reportType === "Weekly Trend") {
        const weekData = groupExpensesByWeek(filteredExpenses);
        const sortedWeeks = Object.keys(weekData).sort();
        const labels = sortedWeeks.map((week, index) => `Week ${index + 1}`);
        const data = sortedWeeks.map((week) => weekData[week]);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Weekly Expenses",
              data: data,
              backgroundColor: "rgba(99, 102, 241, 0.5)",
              borderColor: "rgb(99, 102, 241)",
              borderWidth: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error processing expense data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChart = (chart) => {
    if (chart && chart.canvas) {
      chartInstanceRef.current = chart;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        display: true,
        labels: {
          boxWidth: 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: `Expense Report (${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        })`,
        font: {
          size: window.innerWidth < 768 ? 14 : 16,
        },
      },
    },
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">Loading...</div>
      );
    }

    if (!chartData || !chartData.datasets[0].data.length) {
      return (
        <div className="flex items-center justify-center h-64">
          No data available for selected date range
        </div>
      );
    }

    // Add key to force re-render when chart type changes
    const chartKey = `${reportType}-${dateFrom}-${dateTo}`;

    switch (reportType) {
      case "By category":
        return (
          <Pie
            key={chartKey}
            ref={getChart}
            data={chartData}
            options={chartOptions}
          />
        );
      case "Monthly Trend":
        return (
          <Line
            key={chartKey}
            ref={getChart}
            data={chartData}
            options={chartOptions}
          />
        );
      case "Weekly Trend":
        return (
          <Bar
            key={chartKey}
            ref={getChart}
            data={chartData}
            options={chartOptions}
          />
        );
      default:
        return (
          <Pie
            key={chartKey}
            ref={getChart}
            data={chartData}
            options={chartOptions}
          />
        );
    }
  };

  // Calculate summary data from actual expenses
  const calculateSummaryData = () => {
    const filteredExpenses = filterExpensesByDateRange(
      expenses,
      dateFrom,
      dateTo
    );
    const totalExpenses = filteredExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );
    const averageDaily =
      totalExpenses /
      Math.max(
        1,
        Math.ceil(
          (new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)
        )
      );
    const highestExpense = filteredExpenses.reduce(
      (max, expense) =>
        (expense.amount || 0) > (max.amount || 0) ? expense : max,
      { amount: 0 }
    );

    return {
      totalExpenses: totalExpenses.toFixed(2),
      averageDaily: averageDaily.toFixed(2),
      highestExpense: {
        amount: (highestExpense.amount || 0).toFixed(2),
        category: highestExpense.category || "N/A",
        description: highestExpense.description || "N/A",
      },
    };
  };

  // Calculate comparison data (current vs previous period)
  const calculateComparisonData = () => {
    const currentPeriodExpenses = filterExpensesByDateRange(
      expenses,
      dateFrom,
      dateTo
    );

    // Calculate previous period dates
    const currentStart = new Date(dateFrom);
    const currentEnd = new Date(dateTo);
    const periodLength = currentEnd - currentStart;
    const previousStart = new Date(currentStart.getTime() - periodLength);
    const previousEnd = new Date(currentStart.getTime() - 1);

    const previousPeriodExpenses = filterExpensesByDateRange(
      expenses,
      previousStart.toISOString().split("T")[0],
      previousEnd.toISOString().split("T")[0]
    );

    const currentData = groupExpensesByCategory(currentPeriodExpenses);
    const previousData = groupExpensesByCategory(previousPeriodExpenses);

    // Get all unique categories
    const allCategories = [
      ...new Set([...Object.keys(currentData), ...Object.keys(previousData)]),
    ];

    return {
      labels: allCategories,
      datasets: [
        {
          label: "Previous Period",
          data: allCategories.map((cat) => previousData[cat] || 0),
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 1,
        },
        {
          label: "Current Period",
          data: allCategories.map((cat) => currentData[cat] || 0),
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          borderColor: "rgb(153, 102, 255)",
          borderWidth: 1,
        },
      ],
    };
  };

  const reportOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: "Period Comparison",
        font: {
          size: window.innerWidth < 768 ? 14 : 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount",
        },
      },
    },
  };

  const renderReport = () => {
    const summaryData = calculateSummaryData();

    switch (buttonType) {
      case "Summary":
        return (
          <div>
            <div className="font-semibold text-xl md:text-2xl">
              Expense Summary
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-4">
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  Total Expenses
                </div>
                <div className="font-bold text-xl md:text-2xl">
                  {formatAmount(summaryData.totalExpenses)}
                </div>
              </div>
              <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-4">
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  Average Daily
                </div>
                <div className="font-bold text-xl md:text-2xl">
                  {formatAmount(summaryData.averageDaily)}
                </div>
              </div>
              <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-4">
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  Highest Expense
                </div>
                <div className="font-bold text-xl md:text-2xl">
                  {formatAmount(summaryData.highestExpense.amount)}
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  {summaryData.highestExpense.category}
                </div>
              </div>
            </div>
          </div>
        );
      case "Comparision":
        const comparisonData = calculateComparisonData();
        return (
          <div>
            <div className="font-semibold text-xl md:text-2xl">
              Period Comparison
            </div>
            <div className="h-64 mt-4">
              <Bar data={comparisonData} options={reportOptions} />
            </div>
          </div>
        );
      case "Insights":
        const filteredExpenses = filterExpensesByDateRange(
          expenses,
          dateFrom,
          dateTo
        );
        const categoryData = groupExpensesByCategory(filteredExpenses);
        const totalAmount = Object.values(categoryData).reduce(
          (sum, amount) => sum + amount,
          0
        );
        const topCategory = Object.entries(categoryData).reduce(
          (max, [cat, amount]) =>
            amount > max.amount ? { category: cat, amount } : max,
          { category: "N/A", amount: 0 }
        );

        return (
          <div>
            <div className="font-semibold text-xl md:text-2xl">
              Spending Insights
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="rounded-md p-4 bg-gray-100 dark:bg-gray-800">
                <div className="font-semibold text-sm md:text-base">
                  Top Spending Category
                </div>
                <div className="font-bold text-xl md:text-2xl">
                  {topCategory.category} ({formatAmount(topCategory.amount)})
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  {totalAmount > 0
                    ? ((topCategory.amount / totalAmount) * 100).toFixed(1)
                    : 0}
                  % of total expenses
                </div>
              </div>
              <div className="rounded-md p-4 bg-gray-100 dark:bg-gray-800">
                <div className="font-semibold text-sm md:text-base">
                  Total Categories
                </div>
                <div className="font-bold text-xl md:text-2xl">
                  {Object.keys(categoryData).length} categories
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  Across {filteredExpenses.length} transactions
                </div>
              </div>
              <div className="rounded-md p-4 bg-gray-100 dark:bg-gray-800">
                <div className="font-semibold text-sm md:text-base">
                  Period Range
                </div>
                <div className="font-bold text-xl md:text-2xl">
                  {Math.ceil(
                    (new Date(dateTo) - new Date(dateFrom)) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  From {dateFrom} to {dateTo}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <div className="font-semibold text-xl md:text-2xl">
              Expense Summary
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-4">
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  Total Expenses
                </div>
                <div className="font-bold text-xl md:text-2xl">
                  {formatAmount(summaryData.totalExpenses)}
                </div>
              </div>
              <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-4">
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  Average Daily
                </div>
                <div className="font-bold text-xl md:text-2xl">
                  {formatAmount(summaryData.averageDaily)}
                </div>
              </div>
              <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-4">
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  Highest Expense
                </div>
                <div className="font-bold text-xl md:text-2xl">
                  {formatAmount(summaryData.highestExpense.amount)}
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                  {summaryData.highestExpense.category}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full px-2 md:pl-5">
      <div className="flex flex-col">
        <div className="border rounded-md p-4 md:p-6">
          <div className="font-semibold text-xl md:text-2xl">
            Expense Reports
          </div>
          <div className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Visualize your spending patterns
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="date"
                  className="border rounded-md p-2 text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span className="text-sm">to</span>
                <input
                  type="date"
                  className="border rounded-md p-2 text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <select
                id="category"
                className="border rounded-md p-2 text-sm w-full md:w-auto mt-2 md:mt-0 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="By category">By category</option>
                <option value="Monthly Trend">Monthly Trend</option>
                <option value="Weekly Trend">Weekly Trend</option>
              </select>
            </div>
            
            <button 
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 bg-black dark:bg-white dark:bg-gray-800 text-white dark:text-black px-4 py-2 rounded-md text-sm whitespace-nowrap hover:bg-gray-800 dark:hover:bg-gray-200 dark:bg-gray-700 transition-colors w-full md:w-auto"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="h-64 md:h-80 mt-6">{renderChart()}</div>
        </div>

        <div className="grid grid-cols-3 w-full rounded-md mt-4 bg-gray-100 dark:bg-gray-700 p-1">
          <button
            value="Summary"
            className={`rounded-md py-2 px-1 md:px-2 text-sm md:text-base transition-colors ${
              buttonType === "Summary" ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-100"
            }`}
            onClick={(e) => setButtonType(e.target.value)}
          >
            Summary
          </button>
          <button
            value="Comparision"
            className={`rounded-md py-2 px-1 md:px-2 text-sm md:text-base transition-colors ${
              buttonType === "Comparision" ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-100"
            }`}
            onClick={(e) => setButtonType(e.target.value)}
          >
            Comparison
          </button>
          <button
            value="Insights"
            className={`rounded-md py-2 px-1 md:px-2 text-sm md:text-base transition-colors ${
              buttonType === "Insights" ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-100"
            }`}
            onClick={(e) => setButtonType(e.target.value)}
          >
            Insights
          </button>
        </div>

        <div className="border rounded-md p-4 md:p-6 mt-4">
          {renderReport()}
        </div>
      </div>
    </div>
  );
}

export default Report;

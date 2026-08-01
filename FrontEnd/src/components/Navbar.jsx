import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, Outlet } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Moon, Sun } from "lucide-react";
import useAppStore from "../store/useAppStore";
import AIAssistant from "./AIAssistant";

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, currency, setCurrency } = useAppStore();

  useEffect(() => {
    // Fetch user info
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        withCredentials: true,
      })
      .then((response) => setUser(response.data.user))
      .catch((error) => {
        console.log("Fetch error: ", error);
        window.location.href = "/";
        toast.success("Logged out successfully!");
      });

    // Fetch user preferences
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/preferences`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data?.currency) {
          setCurrency(response.data.currency);
        }
      })
      .catch((err) => console.log("Error fetching preferences", err));
  }, []);


  const handleClick = (e) => {
    e.preventDefault();
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/logout`,{}, {
      withCredentials: true
    })
      .then((result) => {
        console.log(result);
        try {
          if (result.data === "Logged out successfully") {
            navigate("/");
            toast.success("Logged out successfully");
          }
        } catch (error) {
          console.log("logout error ", error);
        }
      })
      .catch((error) => console.log("Logout fetch error ", error));
  };

  return (
    <>
      {/* Header */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 md:px-14 py-4">
          <div className="flex items-center justify-between w-full sm:w-auto mb-2 sm:mb-0">
            <div className="font-bold text-2xl">Expense Tracker</div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center sm:justify-end">
            <select
              value={currency}
              onChange={(e) => {
                const newCurrency = e.target.value;
                setCurrency(newCurrency);
                axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/preferences`, { currency: newCurrency }, { withCredentials: true })
                  .catch(err => console.log("Failed to save currency pref", err));
              }}
              className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm dark:bg-gray-800"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="SGD">SGD (S$)</option>
            </select>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden sm:block">Welcome, {user?.username}</div>
            <button
              onClick={handleClick}
              className="border rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 border-gray-300 dark:border-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row px-4 md:px-8 lg:px-16 py-4 gap-4">
        {/* Left Sidebar (collapsible on mobile) */}
        <div className={`bg-white dark:bg-gray-800 rounded-md p-4 shadow-sm border border-gray-200 dark:border-gray-700 w-full lg:w-60 transition-all ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
          {[
            { label: "Dashboard", path: "/home" },
            { label: "Expenses", path: "/home/expense" },
            { label: "Reports", path: "/home/report" },
            { label: "Budget", path: "/home/budget" },
            { label: "Insights", path: "/home/insight" },
            { label: "Goals", path: "/home/goals" },
            { label: "Subscriptions", path: "/home/subscriptions" },
            { label: "Net Worth", path: "/home/networth" },
            { label: "Splitwise", path: "/home/split" },
            { label: "Rewards 🏆", path: "/home/rewards" },
          ].map((item, idx) => (
            <Link key={idx} to={item.path} onClick={() => setSidebarOpen(false)}>
              <div
              className={`w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-black dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {item.label}
            </div>
            </Link>
          ))}
        </div>
        <div className="flex-1 w-full min-w-0">
          <Outlet/>
        </div>
      </div>
      
      {/* AI Assistant Floating Widget */}
      {user?._id && <AIAssistant userId={user._id} />}
    </>
  );
}

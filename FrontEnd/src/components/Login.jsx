import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currencySymbol } = useCurrencyFormatter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        { username, password },
        {
          withCredentials: true,
        }
      )
      .then((result) => {
        if (result.data.status === "success") {
          toast.success("Login successful! Welcome back!");
          navigate("/home");
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "Login failed. Please try again.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left - Visual */}
          <div className="hidden lg:block">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome Back
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-200">
                  Track your expenses and take control of your finances
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: "📊", title: "Real-time Tracking", desc: "Monitor your spending instantly" },
                  { icon: "📈", title: "Smart Analytics", desc: "Get insights into your patterns" },
                  { icon: "🎯", title: "Budget Goals", desc: "Set and achieve your targets" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-200 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Auth Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{currencySymbol}</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      SpendSense
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-200">Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200">New to SpendSense?</span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="w-full py-3 px-4 border-2 border-gray-200 text-gray-900 dark:text-white font-semibold rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
                >
                  Create an Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


import { useNavigate } from "react-router-dom"
import useCurrencyFormatter from "../hooks/useCurrencyFormatter";

export default function GettingStarted() {
    const navigate = useNavigate();
    const { formatAmount, currencySymbol } = useCurrencyFormatter();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full bg-white dark:bg-gray-800/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">{currencySymbol}</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SpendSense
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-gray-700 dark:text-gray-100 font-medium hover:text-gray-900 dark:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="text-sm font-semibold text-blue-600">Join thousands of smart savers</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Master Your Money,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  Effortlessly
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-200 leading-relaxed max-w-lg">
                Stop wondering where your money goes. SpendSense gives you crystal-clear insights into your spending patterns with beautiful visualizations and actionable analytics.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                >
                  Start Free Today
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:bg-gray-700 transition-colors"
                >
                  Already have an account?
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-8 text-sm text-gray-600 dark:text-gray-200">
                <div>✓ No credit card required</div>
                <div>✓ Free forever</div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-100">Monthly Budget</div>
                    <span className="text-2xl font-bold text-blue-600">{formatAmount(2450)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-200">{formatAmount(1837.50)} spent</div>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    { category: "Food & Dining", amount: formatAmount(385), color: "from-orange-400 to-orange-600" },
                    { category: "Transportation", amount: formatAmount(420), color: "from-blue-400 to-blue-600" },
                    { category: "Entertainment", amount: formatAmount(290), color: "from-purple-400 to-purple-600" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-100">{item.category}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-200">Everything you need to take control of your finances</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Tracking",
                description: "Categorize expenses automatically and track spending across multiple accounts in real-time.",
                icon: "📊",
                gradient: "from-blue-50 to-blue-100",
              },
              {
                title: "Instant Insights",
                description: "Beautiful charts and graphs that reveal spending patterns and help you make smarter decisions.",
                icon: "📈",
                gradient: "from-purple-50 to-purple-100",
              },
              {
                title: "Budget Control",
                description: "Set budgets for each category and get alerts when you're about to exceed your limits.",
                icon: "🎯",
                gradient: "from-pink-50 to-pink-100",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-gray-100 hover:shadow-lg transition-shadow duration-300`}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{currencySymbol}2B+</div>
              <div className="text-blue-100">Tracked Expenses</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9★</div>
              <div className="text-blue-100">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to take control?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are making smarter financial decisions with SpendSense. Start your free journey today.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all text-lg"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">&copy; 2024 SpendSense. All rights reserved.</p>
          <p className="text-sm">Making financial management simple and beautiful</p>
        </div>
      </footer>
    </div>
  )
}

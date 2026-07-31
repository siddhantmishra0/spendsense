# SpendSense 💸

SpendSense is a comprehensive, modern Budget and Expense Tracking application built using the MERN stack (MongoDB, Express, React, Node.js). It empowers users to take control of their personal finances by tracking budgets, monitoring daily expenses, setting financial goals, and gaining insights through interactive reports.

---

## ✨ Features

- **Robust User Authentication**: Secure signup, login, and logout capabilities using JWTs securely stored in HttpOnly cookies.
- **Interactive Dashboard**: Get a real-time overview of your current financial status at a glance.
- **Budget Management**: Create, view, update, and securely delete budget allocations for various categories.
- **Expense Tracking**: Record daily expenses, assign tags, and categorize them effortlessly. Prevents you from exceeding your allocated budget.
- **Financial Goals (New!)**: Set target savings goals, define deadlines, and visually track your progress with dynamic progress bars.
- **Advanced Reports & Insights**: Visual representations of spending habits, monthly/weekly trends, and budget utilization using Chart.js.
- **Export to CSV (New!)**: Download your expense reports directly to a CSV file for offline viewing or accounting purposes.
- **Dark Mode Support (New!)**: Toggle between light and dark themes seamlessly for comfortable viewing in any environment.
- **Optimized Performance**: Leverages **React Query** for intelligent data caching, eliminating unnecessary API calls and providing lightning-fast UI updates.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19
- **State Management & Caching**: `@tanstack/react-query`
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (with Dark Mode integration)
- **Routing**: React Router DOM v7
- **Data Visualization**: Chart.js & React-Chartjs-2
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime Environment**: Node.js
- **Architecture**: Modular Controller/Router MVC Pattern
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ORM)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing
- **CORS**: Configured for secure cross-origin requests

---

## 📂 Project Structure

The project is built on a highly modular architecture, divided into two main directories:

*   `BackEnd/`: Contains the Node.js/Express server.
    *   `/controllers`: Domain-specific controllers (`auth`, `budget`, `expense`, `goal`).
    *   `/routes`: Dedicated express routers for clean API endpoints.
    *   `/models`: Mongoose database schemas.
    *   `/middlewares`: JWT validation and error handling.
*   `FrontEnd/`: Contains the React/Vite application.
    *   `/src/components`: Reusable UI components (Dashboard, Budget, Expenses, Goals, Reports).
    *   `/src/context`: React Context providers (like ThemeProvider).

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn
*   MongoDB instance (local or MongoDB Atlas)

### Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd spendsense
    ```

2.  **Backend Setup**:
    *   Navigate to the backend directory:
        ```bash
        cd BackEnd
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file based on `.env.sample` and provide the necessary environment variables:
        ```env
        PORT=3000
        MONGODB_URL=your_mongodb_connection_string
        CORS_ORIGIN=http://localhost:5173
        ACCESS_TOKEN_SECRET=your_access_secret
        ACCESS_TOKEN_EXPIRY=1d
        REFRESH_TOKEN_SECRET=your_refresh_secret
        REFRESH_TOKEN_EXPIRY=10d
        ```
    *   Start the development server:
        ```bash
        npm run dev
        ```

3.  **Frontend Setup**:
    *   Open a new terminal and navigate to the frontend directory:
        ```bash
        cd FrontEnd
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file based on `.env.sample` and provide the backend API URL:
        ```env
        VITE_API_BASE_URL=http://localhost:3000
        ```
    *   Start the Vite development server:
        ```bash
        npm run dev
        ```

4.  **Access the Application**:
    *   Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

---

## 💡 Usage Highlights

- **Track Progress**: Visit the **Goals** tab to set a new financial goal (e.g., "Vacation Fund"). Click "Add Funds" to incrementally increase your savings.
- **Export Data**: Head to the **Reports** tab, select a date range, and click "Export CSV" to download your data instantly.
- **Dark Mode**: Use the moon/sun icon in the navigation bar to toggle the theme. Your preference is saved across sessions.

---

*Built to make personal finance simple, fast, and beautiful.*

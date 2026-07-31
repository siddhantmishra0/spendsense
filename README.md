# SpendSense 💸🤖

SpendSense is a comprehensive, production-ready **AI-powered Personal Finance Platform** built using the MERN stack (MongoDB, Express, React, Node.js). 

Evolving from a robust expense tracker, SpendSense 2.0 introduces deep data intelligence, OCR receipt scanning, gamification, family expense splitting, and a full Progressive Web App (PWA) experience to empower users to take absolute control of their financial health.

---

## ✨ Key Features

### 🤖 AI & Data Intelligence
- **SpendSense AI Assistant**: A globally accessible, context-aware chatbot powered by the Groq LLM that answers your specific financial questions based on your recent activity.
- **Smart Auto-Categorization**: Natural language parsing automatically assigns categories to your expenses (e.g., typing "Starbucks" auto-selects "Food").
- **Predictive Health Score**: A dynamic algorithm calculates a 0-100 financial health score based on your budget adherence and tracking consistency.
- **AI Savings Insights**: Generates actionable, high-impact savings recommendations by analyzing your raw expense data.

### 🧾 Advanced Entry & Automation
- **AI Receipt Scanner (OCR)**: Upload a receipt image, and client-side `Tesseract.js` combined with our Groq backend will automatically extract the Merchant Name, Total Amount, and Date to magically fill your expense form!
- **Voice Entry**: Speak your expenses out loud (e.g., *"25 dollars for lunch"*) using the Web Speech API, and the system handles the rest.
- **CSV Bank Imports**: Bulk import hundreds of transactions instantly via a smart CSV mapper (`PapaParse`) that auto-assigns categories.
- **Subscriptions Manager**: Track recurring payments (Netflix, Gym) and forecast your true monthly fixed costs.

### 🚀 Wealth & Gamification
- **Net Worth Tracker**: Dynamically log Assets (Cash, Investments, Real Estate) and Liabilities (Loans, Credit Cards) to track your wealth trajectory over time.
- **Gamification Engine**: Earn XP, level up, and unlock Badges (e.g., "Consistent Tracker") by hitting budget goals and logging expenses.
- **Multi-Currency Engine**: Instantly switch between global currencies (USD, EUR, INR, etc.) with real-time formatting across the entire app.

### 🤝 Social & Mobile
- **Expense Splitting (Splitwise-style)**: Create shared bills with friends, track exactly "who owes who", and settle up debts with one click.
- **Progressive Web App (PWA)**: Install SpendSense directly to your Desktop, iOS, or Android home screen for a full-screen, native-app experience.
- **Dark Mode Support**: Seamless toggle between light and dark themes using modern glassmorphism UI tokens.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **State Management**: `Zustand` (Global UI) + `@tanstack/react-query` (Server State)
- **Styling**: Tailwind CSS (Glassmorphism & Gradients)
- **Data Visualization**: Chart.js & React-Chartjs-2
- **Testing**: Vitest, React Testing Library, jsdom
- **PWA**: `vite-plugin-pwa`

### Backend
- **Framework**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ORM
- **AI Integration**: Groq SDK (`llama3-8b-8192` model)
- **Authentication**: JWTs (HttpOnly cookies) & bcrypt
- **Testing**: Jest, Supertest, MongoDB Memory Server

### CI/CD
- **GitHub Actions**: Automated dual-pipeline (Frontend & Backend) testing on all pushes to `main`.

---

## 📂 Project Structure

*   `BackEnd/`: The Node.js/Express API layer.
    *   `/controllers` & `/routes`: Modular MVC endpoints (`ai`, `expense`, `settlement`, `networth`, etc.)
    *   `/services`: Complex business logic (AI parsing, OCR, health algorithms).
    *   `/tests`: Fully isolated `jest` backend test suites using in-memory MongoDB.
*   `FrontEnd/`: The React/Vite PWA application.
    *   `/src/components`: Domain-driven component design (Dashboard, AI-Assistant, Splitwise).
    *   `/src/hooks`: Custom React hooks (e.g., `useCurrencyFormatter`).
    *   `/src/store`: Zustand global state managers.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB instance (local or Atlas)
*   **Groq API Key** (for AI Assistant & OCR features)

### Backend Setup
```bash
cd BackEnd
npm install
```
Create a `.env` file:
```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
GROQ_API_KEY=your_groq_api_key_here
```
Run the development server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd FrontEnd
npm install
```
Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000
```
Run the development server:
```bash
npm run dev
```

### Testing
SpendSense includes a robust automated testing suite.
- **Backend**: `cd BackEnd && npm run test`
- **Frontend**: `cd FrontEnd && npm run test`

---

*SpendSense 2.0 – Because your financial data deserves next-generation intelligence.*

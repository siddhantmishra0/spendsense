import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/authRoutes.js";
import BudgetRouter from "./routes/budgetRoutes.js";
import ExpenseRouter from "./routes/expenseRoutes.js";
import GoalRouter from "./routes/goalRoutes.js";
import UserPreferencesRouter from "./routes/userRoutes.js";
import SubscriptionRouter from "./routes/subscriptionRoutes.js";
import AIRouter from "./routes/ai.routes.js";
import HealthRouter from "./routes/healthRoutes.js";
import GamificationRouter from "./routes/gamificationRoutes.js";
import NetWorthRouter from "./routes/networthRoutes.js";
import SettlementRouter from "./routes/settlementRoutes.js";
import dotenv from "dotenv";

dotenv.config({});
const app = express();

// --- CORS ---
const allowedOrigins = [process.env.CORS_ORIGIN, "http://localhost:4173"];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight support
// app.options("*", cors());

// Fallback headers (Render fixes)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/", UserRouter);
app.use("/home/budget", BudgetRouter);
app.use("/home/expense", ExpenseRouter);
app.use("/home/goals", GoalRouter);
app.use("/api/v1/user", UserPreferencesRouter);
app.use("/api/v1/subscriptions", SubscriptionRouter);
app.use("/api/v1/ai", AIRouter);
app.use("/api/v1/health", HealthRouter);
app.use("/api/v1/gamification", GamificationRouter);
app.use("/api/v1/networth", NetWorthRouter);
app.use("/api/v1/settlements", SettlementRouter);

export { app };

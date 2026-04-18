import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/authRoutes.js";
import dotenv from "dotenv";

dotenv.config({});
const app = express();

// --- CORS ---
app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight support
// app.options("*", cors());

// Fallback headers (Render fixes)
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "http://localhost:5173"
  );
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

export { app };

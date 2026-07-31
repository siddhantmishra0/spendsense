import express from "express";
import { getProgress } from "../controllers/gamification.controller.js";

const router = express.Router();

router.get("/progress", getProgress);

export default router;

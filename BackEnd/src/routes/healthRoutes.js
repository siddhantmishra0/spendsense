import express from "express";
import { getHealthScore } from "../controllers/health.controller.js";

const router = express.Router();

router.get("/", getHealthScore);

export default router;

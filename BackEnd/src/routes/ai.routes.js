import express from "express";
import { getInsights, chat, categorize, parseReceipt } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/insights", getInsights);
router.post("/chat", chat);
router.post("/categorize", categorize);
router.post("/receipt", parseReceipt);

export default router;

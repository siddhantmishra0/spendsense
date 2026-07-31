import express from "express";
import { getNetWorthHistory, updateNetWorth } from "../controllers/networth.controller.js";

const router = express.Router();

router.get("/", getNetWorthHistory);
router.post("/", updateNetWorth);

export default router;

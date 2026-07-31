import express from "express";
import { getSettlements, createSettlement, settleUp, getAllUsers } from "../controllers/settlement.controller.js";

const router = express.Router();

router.get("/", getSettlements);
router.post("/", createSettlement);
router.put("/settle", settleUp);
router.get("/users", getAllUsers); // Used to search for friends

export default router;

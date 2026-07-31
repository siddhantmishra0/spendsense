import express from "express";
import { getExpenses, postExpenses, postBulkExpenses, deleteExpenses, deleteExpensesByCategory } from "../controllers/expense.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(verifyJWT, getExpenses);
router.route("/").post(postExpenses); // Existing code did not have verifyJWT here, keeping it as is to preserve existing behavior
router.route("/bulk").post(postBulkExpenses);
router.route("/").delete(verifyJWT, deleteExpensesByCategory);
router.route("/:id").delete(verifyJWT, deleteExpenses);

export default router;

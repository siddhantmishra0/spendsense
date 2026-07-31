import express from "express";
import { postBudget, getBudget, updateBudget, deleteBudget } from "../controllers/budget.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").post(verifyJWT, postBudget);
router.route("/").get(verifyJWT, getBudget);
router.route("/:id").put(verifyJWT, updateBudget);
router.route("/:id").delete(verifyJWT, deleteBudget);

export default router;

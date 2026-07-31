import express from "express";
import { getGoals, postGoal, updateGoal, deleteGoal } from "../controllers/goal.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(verifyJWT, getGoals);
router.route("/").post(verifyJWT, postGoal);
router.route("/:id").put(verifyJWT, updateGoal);
router.route("/:id").delete(verifyJWT, deleteGoal);

export default router;

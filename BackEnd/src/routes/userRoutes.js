import express from "express";
import { getPreferences, updatePreferences } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/preferences").get(verifyJWT, getPreferences);
router.route("/preferences").put(verifyJWT, updatePreferences);

export default router;

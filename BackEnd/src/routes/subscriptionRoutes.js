import express from "express";
import { getSubscriptions, postSubscription, deleteSubscription, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(verifyJWT, getSubscriptions);
router.route("/").post(verifyJWT, postSubscription);
router.route("/:id").delete(verifyJWT, deleteSubscription);
router.route("/:id/toggle").patch(verifyJWT, toggleSubscription);

export default router;

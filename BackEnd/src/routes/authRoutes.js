import express from "express"
import {register, login, logout, refreshAccessToken, getLogin} from "../controllers/authController.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").post(verifyJWT,logout)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/login").get(verifyJWT,getLogin)

export default router
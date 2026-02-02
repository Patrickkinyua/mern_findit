import express from "express"
import { loginUse, registerUser, logoutUser, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/register", registerUser);
router.post("/login", loginUse);
router.post("/logout", authenticateToken, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router
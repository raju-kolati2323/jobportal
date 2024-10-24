import express from "express";
import { forgotPassword, verifyOtpAndResetPassword } from "../controllers/forgotPassword.controller.js";
const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtpAndResetPassword);

export default router;

import express from "express"
import { verifyRazorpayPayment } from "../controllers/payment.controller.js";
const router = express.Router();
// router.post("/verify-payment", verifyRazorpayPayment);
router.route("/verify-payment").post(verifyRazorpayPayment);

export default router;
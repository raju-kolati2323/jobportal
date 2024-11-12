// import Razorpay from "razorpay";
// import crypto from "crypto";
// import { Payment } from "../models/payment.model.js";
// import dotenv from 'dotenv';
// dotenv.config();

// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Create payment order
// export const createPaymentOrder = async (req,res) => {
//     const { jobId, adminId } = req.body;
//     try {
//         const amount = 100 * 100; // Example job cost

//         const order = await razorpayInstance.orders.create({
//             amount,
//             currency: "INR",
//             receipt: `job_${jobId}`,
//             payment_capture: 1,
//         });

//         // const paymentId = order.id;
        
//         return res.json({ success: true, adminId, orderId: order.id });
//     } catch (error) {
//         console.error("Payment order creation failed", error);
//         return res.status(500).json({ success: false, message: "Payment order creation failed", error: error.message });
//     }
// };

// // Verify payment
// export const verifyPayment = async (req, res) => {
//     const { paymentId, orderId, signature } = req.body;

//     try {
//         const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
//         hmac.update(orderId + "|" + paymentId);
//         const generatedSignature = hmac.digest("hex");

//         if (generatedSignature !== signature) {
//             return res.status(400).json({ success: false, message: "Payment verification failed: Invalid signature" });
//         }

//         // Verify payment and create a record in the database
//         const payment = await Payment.create({
//             paymentId,
//             orderId,
//             status: "successful",
//         });

//         return res.json({ success: true, message: "Payment verified successfully", payment });
//     } catch (error) {
//         console.error("Payment verification failed", error);
//         return res.status(500).json({ success: false, message: "Payment verification failed", error: error.message });
//     }
// };
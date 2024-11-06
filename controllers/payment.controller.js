import Razorpay from "razorpay";
import crypto from "crypto";
import { Payment } from "../models/payment.model.js";
import { Job } from "../models/job.model.js";
require('dotenv').config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a Razorpay order for job posting
export const createPaymentOrder = async (req, res) => {
    try {
        const { jobId } = req.body;
        const adminId = req.user.id;

        // Job cost
        const amount = 100 * 100;

        const options = {
            amount: amount,
            currency: "INR",
            receipt: `job_${jobId}`,
            payment_capture: 1,
        };

        const order = await razorpayInstance.orders.create(options);

        // Save payment record
        const payment = await Payment.create({
            adminId,
            amount: 100,
            paymentId: order.id,
            status: "pending",
            jobId,
        });

        res.status(201).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error("Payment order creation failed", error);
        res.status(500).json({ success: false, message: "Payment order creation failed" });
    }
};

// Verify payment and update job status
export const verifyPayment = async (req, res) => {
    try {
        const { paymentId, orderId, signature, jobId } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest("hex");

        if (signature === expectedSignature) {
            // Payment verified
            await Payment.findOneAndUpdate(
                { paymentId: orderId },
                { status: "successful" },
                { new: true }
            );

            // Update job status to "posted"
            await Job.findByIdAndUpdate(jobId, { status: "posted" });

            res.status(200).json({ success: true, message: "Payment successful" });
        } else {
            // Payment verification failed
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Payment verification failed", error);
        res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};

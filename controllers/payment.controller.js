import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PaymentPlan, Payment } from '../models/payment.model.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Function to create payment order
export const createPaymentOrder = async (planType) => {
    // Find the payment plan by its plan type (basic, standard, or premium)
    const paymentPlan = await PaymentPlan.findOne({ planType, active: true });

    if (!paymentPlan) {
        throw new Error("No active plan found for the given plan type");
    }
    const options = {
        amount: paymentPlan.price * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
    };
    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        throw new Error("Error creating payment order");
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    const { order_id, payment_id, signature } = req.body;

    try {
        // Generate the signature to verify it
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(order_id + "|" + payment_id);
        const generatedSignature = hmac.digest('hex');

        // If signature matches, verify payment and store it
        if (generatedSignature === signature) {
            const paymentOrder = await Payment.findOne({ paymentOrderId: order_id });
            if (!paymentOrder) {
                return res.status(404).json({
                    message: "Payment order not found.",
                    success: false,
                });
            }
            paymentOrder.paymentStatus = 'success';
            paymentOrder.paymentId = payment_id;
            paymentOrder.paymentSignature = signature;
            paymentOrder.razorpaySignatureVerified = true;

            // Find the payment plan associated with the order and activate it
            const paymentPlan = await PaymentPlan.findOne({ planType: paymentOrder.planType });
            if (!paymentPlan) {
                return res.status(404).json({
                    message: "Payment plan not found.",
                    success: false,
                });
            }
            // Activate the plan and set expiry date
            paymentPlan.active = true;
            
            if (paymentPlan.planType === 'premium') {
                paymentPlan.expiryDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // Set expiry to 30 days
            }
            await paymentPlan.save();

            await paymentOrder.save();

            return res.status(200).json({
                message: "Payment verified and plan activated.",
                success: true,
            });
        } else {
            return res.status(400).json({
                message: "Payment verification failed.",
                success: false,
            });
        }
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};
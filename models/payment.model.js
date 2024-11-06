import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentId: {
        type: String,
        // required: true,
    },
    orderId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "successful", "failed"],
        default: "pending",
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const Payment = mongoose.model("Payment", paymentSchema);

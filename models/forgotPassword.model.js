import mongoose from "mongoose";

const forgotPasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '5m' // OTP expires in 5 minutes
  }
});

export const ForgotPassword = mongoose.model("ForgotPassword", forgotPasswordSchema);

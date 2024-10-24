// backend/controllers/forgotPassword.controller.js
import { User } from "../models/user.model.js";
import { ForgotPassword} from "../models/forgotPassword.model.js"
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs"

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID_FORGOT,
    pass: process.env.EMAIL_PASS_FORGOT
  }
});

// Request forgot password
export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  // Validate user email and role
  const user = await User.findOne({ email, role });
  if (!user) {
    return res.status(404).json({ message: "User not found with this email and role." });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to the database
  const forgotPasswordEntry = new ForgotPassword({ userId: user._id, otp });
  await forgotPasswordEntry.save();

  // Send OTP via email
  const mailOptions = {
    from: process.env.EMAIL_ID_FORGOT,
    to: email,
    subject: "OTP for Job Portal password reset",
    html: `    
        <div style="border: 1px solid #ccc; border-radius: 5px; padding: 20px; max-width: 600px; font-family: Arial, sans-serif;">
          <h2 style="color: #333;"><u>OTP for Password Reset:</u></h2>
          <p><strong>Email:</strong> ${email}</p>
          <p> Your OTP for password reset is: <strong>${otp}</strong>. It is valid for 5 minutes.</p>
        </div>
      `
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Error sending email." });
  }
};

// Verify OTP and reset password
export const verifyOtpAndResetPassword = async (req, res) => {
  const { email, role, otp, newPassword } = req.body;

  // Validate user email and role
  const user = await User.findOne({ email, role });
  if (!user) {
    return res.status(404).json({ message: "User not found with this email and role." });
  }

  // Find the OTP entry
  const otpEntry = await ForgotPassword.findOne({ userId: user._id, otp });
  if (!otpEntry) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user password
  user.password = hashedPassword; // Make sure to hash this in your user model
  await user.save();

  // Delete OTP entry
  await ForgotPassword.deleteOne({ _id: otpEntry._id });

  return res.status(200).json({ message: "Password updated successfully." });
};

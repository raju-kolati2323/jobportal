import mongoose from "mongoose";

const paymentPlanSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planType: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    jobLimit: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date,
        required: function() {
            return this.planType === 'premium';
        },
    },
    jobsPosted: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Before saving, assign price and job limit based on planType
paymentPlanSchema.pre('save', function(next) {
    if (this.isNew) {
      if (this.planType === 'basic') {
        this.price = 299; 
        this.jobLimit = 1;
      } else if (this.planType === 'standard') {
        this.price = 799; 
        this.jobLimit = 3;
      } else if (this.planType === 'premium') {
        this.price = 1499;
        this.jobLimit = -1;
        if (!this.expiryDate) {
            this.expiryDate = new Date(new Date().setMonth(new Date().getMonth() + 1)); // Set expiryDate to 1 month from now
        }
      }
    }
    next();
  });


const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentOrderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentSignature: {
        type: String,
        required: true
    },
    razorpaySignatureVerified: {
        type: Boolean,
        default: false
    },
    planType: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        required: true
    },
    planDetails: {
        type: Object,
        required: true,
    }
}, { timestamps: true });

export const PaymentPlan = mongoose.model("PaymentPlan", paymentPlanSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    salary: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true },
    position: { type: String, required: true },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    jobId: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, require:true },
}, { timestamps: true });

export const Wishlist = mongoose.model('Wishlist', WishlistSchema);

import { Wishlist } from "../models/wishlist.model.js";

// Add item to wishlist
export const addToWishlist = async (req, res) => {
    const { title, description, salary, location, jobType, position, company, jobId, userId} = req.body;
    // const userId = req.user._id;

    try {
        

        const newWishlistItem = new Wishlist({
            title,
            description,
            salary,
            location,
            jobType,
            position,
            company,
            jobId,
            userId
        });

        await newWishlistItem.save();
        res.status(201).json({ 
            message: "Item added to wishlist successfully.", 
            item: newWishlistItem 
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Failed to add item to wishlist.", 
            error: error.message 
        });
    }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
    const { itemId } = req.params;

    try {
        const wishlistItem = await Wishlist.findByIdAndDelete(itemId);

        if (!wishlistItem) {
            return res.status(404).json({ message: "Item not found." });
        }

        res.status(200).json({ message: "Item removed from wishlist successfully." });

    } catch (error) {
        res.status(500).json({ 
            message: "Failed to remove item from wishlist.", 
            error: error.message 
        });
    }
};

// Get wishlist items
export const getWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const wishlistItems = await Wishlist.find({userId})
            .populate('company', 'name logo')
            .lean(); // Use lean() for better performance if you don't need Mongoose document methods
        res.status(200).json({ wishlist: wishlistItems });
    } catch (error) {
        res.status(500).json({ 
            message: "Failed to fetch wishlist.", 
            error: error.message 
        });
    }
};

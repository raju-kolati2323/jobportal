import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/wishlist.controller.js';
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post('/add',isAuthenticated, addToWishlist);
router.delete('/remove/:itemId',isAuthenticated, removeFromWishlist);
router.get('/:userId',isAuthenticated, getWishlist);

export default router;

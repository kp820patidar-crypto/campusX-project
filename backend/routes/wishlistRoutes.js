import express from 'express';
import { Wishlist } from '../models/Wishlist.js';
import { Listing } from '../models/Listing.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/wishlist
 * @desc    Get all wishlisted listings for the authenticated user
 * @access  Private
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const items = await Wishlist.find({ userId: req.user._id })
      .populate({
        path: 'listingId',
        populate: {
          path: 'sellerId',
          select: 'name college department year',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out items where listing was deleted from DB
    const validWishlist = items.filter((item) => item.listingId != null);

    res.json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist.map((w) => ({
        wishlistId: w._id,
        savedAt: w.createdAt,
        listing: w.listingId,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/wishlist/:listingId
 * @desc    Add a listing to wishlist
 * @access  Private
 */
router.post('/:listingId', protect, async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      userId: req.user._id,
      listingId,
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Listing is already in your wishlist.',
        isWishlisted: true,
      });
    }

    await Wishlist.create({
      userId: req.user._id,
      listingId,
    });

    res.status(201).json({
      success: true,
      message: 'Item saved to wishlist!',
      isWishlisted: true,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/wishlist/:listingId
 * @desc    Remove a listing from wishlist
 * @access  Private
 */
router.delete('/:listingId', protect, async (req, res, next) => {
  try {
    const { listingId } = req.params;

    await Wishlist.findOneAndDelete({
      userId: req.user._id,
      listingId,
    });

    res.json({
      success: true,
      message: 'Item removed from wishlist.',
      isWishlisted: false,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


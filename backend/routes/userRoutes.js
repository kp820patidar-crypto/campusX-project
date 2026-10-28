import express from 'express';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';

const router = express.Router();

/**
 * @route   GET /api/users/:id
 * @desc    Get public seller profile and their public listings
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name college department year profileImage createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    const listings = await Listing.find({
      sellerId: user._id,
      status: 'available',
    }).sort({ createdAt: -1 });

    const totalSold = await Listing.countDocuments({
      sellerId: user._id,
      status: 'sold',
    });

    res.json({
      success: true,
      user,
      listings,
      stats: {
        activeListings: listings.length,
        soldListings: totalSold,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


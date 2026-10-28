import express from 'express';
import { Listing, CATEGORIES, CONDITIONS } from '../models/Listing.js';
import { Wishlist } from '../models/Wishlist.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload, processUploadedFiles } from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   GET /api/listings
 * @desc    Get all listings with filtering, search, sorting, and pagination
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      category,
      condition,
      college,
      listingType,
      minPrice,
      maxPrice,
      status = 'available',
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Filter by status (unless 'all' is explicitly requested)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Condition filter
    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    // College filter
    if (college && college !== 'All') {
      query.college = college;
    }

    // Listing type (sale / exchange)
    if (listingType && listingType !== 'All') {
      query.listingType = listingType;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Text search in title or description
    if (search && search.trim() !== '') {
      const sanitized = search.trim();
      query.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
      ];
    }

    // Sort order
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price-low') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-high') {
      sortOptions = { price: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('sellerId', 'name college department year profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: listings.length,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      listings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/listings/mine
 * @desc    Get all listings created by the logged-in student
 * @access  Private
 */
router.get('/mine', protect, async (req, res, next) => {
  try {
    const listings = await Listing.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/listings/categories
 * @desc    Get metadata: categories and conditions
 * @access  Public
 */
router.get('/metadata', (req, res) => {
  res.json({
    success: true,
    categories: CATEGORIES,
    conditions: CONDITIONS,
  });
});

/**
 * @route   GET /api/listings/:id
 * @desc    Get single listing by ID with seller info and related items
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'sellerId',
      'name college department year profileImage createdAt'
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or has been removed.',
      });
    }

    // Increment views
    listing.views = (listing.views || 0) + 1;
    await listing.save();

    // Check if wishlisted by current user
    let isWishlisted = false;
    if (req.user) {
      const wish = await Wishlist.findOne({
        userId: req.user._id,
        listingId: listing._id,
      });
      isWishlisted = Boolean(wish);
    }

    // Fetch up to 4 related listings from same category or college
    const relatedListings = await Listing.find({
      _id: { $ne: listing._id },
      category: listing.category,
      status: 'available',
    })
      .populate('sellerId', 'name college')
      .limit(4);

    res.json({
      success: true,
      listing,
      isWishlisted,
      relatedListings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/listings
 * @desc    Create a new listing
 * @access  Private
 */
router.post(
  '/',
  protect,
  upload.array('images', 5),
  processUploadedFiles,
  async (req, res, next) => {
    try {
      const {
        title,
        description,
        price,
        listingType = 'sale',
        preferredExchange,
        category,
        condition,
        college,
        pickupLocation,
        directImageUrls, // Can pass image URLs as JSON string or array if not uploading binary
      } = req.body;

      // Validation
      if (!title || !description || price === undefined || !category || !condition || !pickupLocation) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, price, category, condition, and campus pickup location are required.',
        });
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number.',
        });
      }

      if (listingType === 'sale' && numPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Sale listings must have a price greater than ₹0. For exchange items, choose listing type Exchange.',
        });
      }

      // Collect image URLs from uploaded files and optional direct URLs
      let finalImages = [...(req.uploadedImageUrls || [])];

      if (directImageUrls) {
        try {
          const parsed = typeof directImageUrls === 'string' ? JSON.parse(directImageUrls) : directImageUrls;
          if (Array.isArray(parsed)) {
            finalImages = [...finalImages, ...parsed.filter((url) => typeof url === 'string' && url.startsWith('http'))];
          }
        } catch (e) {
          if (typeof directImageUrls === 'string' && directImageUrls.startsWith('http')) {
            finalImages.push(directImageUrls);
          }
        }
      }

      // Default placeholder image if none provided
      if (finalImages.length === 0) {
        finalImages.push('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80');
      }

      const listing = await Listing.create({
        sellerId: req.user._id,
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        listingType,
        preferredExchange: preferredExchange?.trim() || '',
        category,
        condition,
        college: college?.trim() || req.user.college || 'Campus',
        pickupLocation: pickupLocation.trim(),
        images: finalImages,
        status: 'available',
      });

      const populatedListing = await Listing.findById(listing._id).populate(
        'sellerId',
        'name college department year profileImage'
      );

      res.status(201).json({
        success: true,
        message: 'Listing published successfully!',
        listing: populatedListing,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PATCH /api/listings/:id
 * @desc    Update listing (owner or admin only)
 * @access  Private
 */
router.patch(
  '/:id',
  protect,
  upload.array('images', 5),
  processUploadedFiles,
  async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found.',
        });
      }

      // Ownership verification
      if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only edit your own listings.',
        });
      }

      const {
        title,
        description,
        price,
        listingType,
        preferredExchange,
        category,
        condition,
        college,
        pickupLocation,
        existingImages,
      } = req.body;

      if (title) listing.title = title.trim();
      if (description) listing.description = description.trim();
      if (price !== undefined) {
        const numPrice = Number(price);
        if (numPrice < 0) {
          return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
        }
        listing.price = numPrice;
      }
      if (listingType) listing.listingType = listingType;
      if (preferredExchange !== undefined) listing.preferredExchange = preferredExchange.trim();
      if (category) listing.category = category;
      if (condition) listing.condition = condition;
      if (college) listing.college = college.trim();
      if (pickupLocation) listing.pickupLocation = pickupLocation.trim();

      // Handle image updates
      let updatedImages = [];
      if (existingImages) {
        try {
          const parsed = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
          if (Array.isArray(parsed)) updatedImages = parsed;
        } catch (e) {
          if (typeof existingImages === 'string') updatedImages = [existingImages];
        }
      } else {
        updatedImages = listing.images;
      }

      if (req.uploadedImageUrls && req.uploadedImageUrls.length > 0) {
        updatedImages = [...updatedImages, ...req.uploadedImageUrls];
      }

      if (updatedImages.length > 0) {
        listing.images = updatedImages;
      }

      await listing.save();

      const populated = await Listing.findById(listing._id).populate(
        'sellerId',
        'name college department year profileImage'
      );

      res.json({
        success: true,
        message: 'Listing updated successfully.',
        listing: populated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PATCH /api/listings/:id/status
 * @desc    Toggle or set status (available / sold)
 * @access  Private
 */
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only change status for your own listings.',
      });
    }

    const { status } = req.body;
    if (status && ['available', 'sold'].includes(status)) {
      listing.status = status;
    } else {
      listing.status = listing.status === 'available' ? 'sold' : 'available';
    }

    await listing.save();

    res.json({
      success: true,
      message: `Listing marked as ${listing.status}.`,
      status: listing.status,
      listing,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete a listing
 * @access  Private
 */
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own listings.',
      });
    }

    // Clean up wishlist references
    await Wishlist.deleteMany({ listingId: listing._id });

    // Remove listing
    await Listing.findByIdAndDelete(listing._id);

    res.json({
      success: true,
      message: 'Listing deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;


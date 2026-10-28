import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only wishlist a listing once
wishlistSchema.index({ userId: 1, listingId: 1 }, { unique: true });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);


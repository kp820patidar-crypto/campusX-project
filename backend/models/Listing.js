import mongoose from 'mongoose';

export const CATEGORIES = [
  'Books & Study Materials',
  'Electronics',
  'Calculators & Lab Equipment',
  'Cycles & Transport',
  'Hostel Essentials',
  'Furniture',
  'Clothing & Accessories',
  'Sports & Fitness',
  'Other',
];

export const CONDITIONS = ['Like New', 'Good', 'Fair'];

const listingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: 'text',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      index: 'text',
    },
    price: {
      type: Number,
      required: [true, 'Price in INR is required'],
      min: [0, 'Price cannot be negative'],
    },
    listingType: {
      type: String,
      enum: ['sale', 'exchange'],
      default: 'sale',
    },
    preferredExchange: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    condition: {
      type: String,
      required: [true, 'Product condition is required'],
      enum: {
        values: CONDITIONS,
        message: '{VALUE} is not a valid condition',
      },
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    college: {
      type: String,
      required: [true, 'College is required'],
      trim: true,
      index: true,
    },
    pickupLocation: {
      type: String,
      required: [true, 'Campus pickup location is required (e.g., Hostel Gate, Library Quad)'],
      trim: true,
      maxlength: [150, 'Pickup location cannot exceed 150 characters'],
    },
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for common query combinations
listingSchema.index({ category: 1, status: 1, createdAt: -1 });
listingSchema.index({ college: 1, status: 1, createdAt: -1 });

export const Listing = mongoose.model('Listing', listingSchema);


import mongoose from 'mongoose';

export const REPORT_REASONS = [
  'Inappropriate Item',
  'Prohibited/Illegal Item',
  'Misleading Information',
  'Suspected Scam',
  'Duplicate Listing',
  'Other',
];

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
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
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: {
        values: REPORT_REASONS,
        message: '{VALUE} is not an accepted reason',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent same user from reporting the same listing multiple times while pending
reportSchema.index({ reporterId: 1, listingId: 1 }, { unique: true });

export const Report = mongoose.model('Report', reportSchema);


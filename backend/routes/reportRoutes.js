import express from 'express';
import { Report, REPORT_REASONS } from '../models/Report.js';
import { Listing } from '../models/Listing.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/reports/reasons
 * @desc    Get list of accepted report reasons
 * @access  Public
 */
router.get('/reasons', (req, res) => {
  res.json({
    success: true,
    reasons: REPORT_REASONS,
  });
});

/**
 * @route   POST /api/reports
 * @desc    Report an inappropriate, prohibited, or suspicious listing
 * @access  Private
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { listingId, reason, description } = req.body;

    if (!listingId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID and report reason are required.',
      });
    }

    if (!REPORT_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report reason selected.',
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    // Check duplicate pending report
    const existing = await Report.findOne({
      reporterId: req.user._id,
      listingId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a report for this listing. Our moderators are reviewing it.',
      });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      listingId,
      reason,
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for helping keep CampusX safe. Your report has been submitted to campus moderators.',
      reportId: report._id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/reports/admin
 * @desc    List all submitted reports (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin', protect, requireAdmin, async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email college')
      .populate({
        path: 'listingId',
        populate: { path: 'sellerId', select: 'name college email' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/reports/admin/:id
 * @desc    Moderate report (status update or remove reported listing)
 * @access  Private (Admin)
 */
router.patch('/admin/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const { status, takeDownListing } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (status) {
      report.status = status;
    }

    if (takeDownListing && report.listingId) {
      await Listing.findByIdAndDelete(report.listingId);
      report.status = 'action_taken';
    }

    await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully.',
      report,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


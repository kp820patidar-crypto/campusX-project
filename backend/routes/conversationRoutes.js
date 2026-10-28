import express from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Listing } from '../models/Listing.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/conversations
 * @desc    Start or retrieve conversation for a listing
 * @access  Private
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { listingId, message } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID is required to start a conversation.',
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    // Prevent seller from messaging themselves
    if (listing.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot initiate a conversation with yourself on your own listing.',
      });
    }

    const participants = [req.user._id, listing.sellerId];

    // Find existing conversation for this listing between these 2 users
    let conversation = await Conversation.findOne({
      listingId: listing._id,
      participants: { $all: participants },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        listingId: listing._id,
        participants,
        lastMessage: {
          text: message ? message.trim() : 'Started a conversation about this item.',
          senderId: req.user._id,
          createdAt: new Date(),
        },
      });

      if (message && message.trim()) {
        await Message.create({
          conversationId: conversation._id,
          senderId: req.user._id,
          text: message.trim(),
        });
      }
    } else if (message && message.trim()) {
      // Conversation exists, add message
      await Message.create({
        conversationId: conversation._id,
        senderId: req.user._id,
        text: message.trim(),
      });
      conversation.lastMessage = {
        text: message.trim(),
        senderId: req.user._id,
        createdAt: new Date(),
      };
      await conversation.save();
    }

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name college department profileImage')
      .populate('listingId', 'title price images status college pickupLocation');

    res.status(200).json({
      success: true,
      conversation: populated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for the current user
 * @access  Private
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name college department profileImage')
      .populate('listingId', 'title price images status college pickupLocation')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/conversations/:id/messages
 * @desc    Get all messages for a specific conversation
 * @access  Private
 */
router.get('/:id/messages', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name college department profileImage')
      .populate('listingId', 'title price images status sellerId');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Check that requester is a participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not a participant in this conversation.',
      });
    }

    // Mark unread messages sent by other participant as read
    await Message.updateMany(
      {
        conversationId: conversation._id,
        senderId: { $ne: req.user._id },
        readAt: null,
      },
      {
        $set: { readAt: new Date() },
      }
    );

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/conversations/:id/messages
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post('/:id/messages', protect, async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty.',
      });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Authorization check
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not a participant in this conversation.',
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      text: text.trim(),
    });

    // Update conversation last message timestamp
    conversation.lastMessage = {
      text: text.trim(),
      senderId: req.user._id,
      createdAt: new Date(),
    };
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'senderId',
      'name profileImage'
    );

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


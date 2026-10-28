import express from 'express';
import { User } from '../models/User.js';
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  protect,
} from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new college student account
 * @access  Public
 * @note    IMPORTANT REQUIREMENT: Newly registered users must NOT be automatically
 *          logged in. They must explicitly log in after creating their account.
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, college, department, year } = req.body;

    // Validate required fields
    if (!name || !email || !password || !college) {
      return res.status(400).json({
        success: false,
        message: 'Name, college email, password, and college name are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // Optional college email validation (can be configured via env: ALLOWED_EMAIL_DOMAINS)
    const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS
      ? process.env.ALLOWED_EMAIL_DOMAINS.split(',').map((d) => d.trim().toLowerCase())
      : null;

    if (allowedDomains && allowedDomains.length > 0) {
      const emailDomain = email.split('@')[1]?.toLowerCase();
      const isAllowed = allowedDomains.some((dom) => emailDomain?.endsWith(dom));
      if (!isAllowed) {
        return res.status(400).json({
          success: false,
          message: `Only student emails from permitted college domains (${allowedDomains.join(', ')}) are allowed.`,
        });
      }
    }

    // Create student account
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // hashed by pre-save hook
      college: college.trim(),
      department: department?.trim() || 'General',
      year: year?.trim() || '1st Year',
      role: 'student',
    });

    // NOTE: Explicitly DO NOT set session cookie and DO NOT return auto-login token.
    // The user MUST explicitly log in on the login page.
    res.status(201).json({
      success: true,
      requiresLogin: true,
      message: 'Account created successfully! Please log in with your credentials to access CampusX.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get session token / cookie
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    // Generate token and set HttpOnly cookie
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Log out current user & clear cookie
 * @access  Public
 */
router.post('/logout', (req, res) => {
  clearTokenCookie(res);
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in student profile
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      college: req.user.college,
      department: req.user.department,
      year: req.user.year,
      profileImage: req.user.profileImage,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
});

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update current student profile details
 * @access  Private
 */
router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { name, college, department, year, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (college) user.college = college.trim();
    if (department) user.department = department.trim();
    if (year) user.year = year.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.patch('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current password and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully. Please keep your credentials secure.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;


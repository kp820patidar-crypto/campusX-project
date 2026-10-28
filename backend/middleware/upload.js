import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage for Cloudinary or Disk storage for fallback
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `campusx-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

export const upload = multer({
  storage: isCloudinaryConfigured ? memoryStorage : diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // max 5 files
  },
  fileFilter,
});

// Helper to upload a buffer to Cloudinary via stream
const uploadToCloudinary = (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusx/listings',
        public_id: `listing-${Date.now()}-${path.parse(filename).name}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// Middleware to process uploaded files into URLs
export const processUploadedFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.uploadedImageUrls = [];
      return next();
    }

    if (isCloudinaryConfigured) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, file.originalname)
      );
      req.uploadedImageUrls = await Promise.all(uploadPromises);
    } else {
      // Local URLs
      req.uploadedImageUrls = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    }
    next();
  } catch (error) {
    console.error('File upload processing error:', error);
    next(new Error(`Image upload failed: ${error.message}`));
  }
};


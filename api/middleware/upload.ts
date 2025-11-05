import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage for different upload types
const createStorage = (uploadDir: string) => {
  return multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      cb(null, path.join(__dirname, '../../uploads', uploadDir));
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      cb(null, `${basename}-${uniqueSuffix}${ext}`);
    }
  });
};

// File filter to only allow images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

// Create upload middleware for different resource types
export const uploadEventImage = multer({
  storage: createStorage('events'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadPodcastImage = multer({
  storage: createStorage('podcast'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadRaffleImage = multer({
  storage: createStorage('raffles'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Generic image upload
export const uploadImage = multer({
  storage: createStorage('general'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to get public URL for uploaded file
export const getFileUrl = (req: Request, file: Express.Multer.File): string => {
  // Extract the relative path from uploads directory
  const relativePath = file.path.split('uploads')[1];
  return `/brewedat/uploads${relativePath}`;
};

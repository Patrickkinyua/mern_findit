import multer from "multer";
import path from "path";

// Use memory storage since we're uploading to Cloudinary
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, gif, webp)"), false);
  }
};

// Configure multer for memory storage
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Middleware to handle upload errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 5MB limit",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded",
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }
  next();
};

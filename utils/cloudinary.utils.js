import cloudinary from "../config/cloudinary.config.js";
import { Readable } from "stream";

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Cloudinary folder (e.g., "findit/items", "findit/profiles")
 * @param {string} publicId - Optional custom public ID
 * @returns {Promise<Object>} - Cloudinary upload response
 */
export const uploadToCloudinary = async (fileBuffer, folder, publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        public_id: publicId,
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Cloudinary delete response
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
export const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<Buffer>} fileBuffers - Array of file buffers
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Array>} - Array of Cloudinary responses
 */
export const uploadMultipleToCloudinary = async (fileBuffers, folder) => {
  try {
    const uploadPromises = fileBuffers.map((buffer) =>
      uploadToCloudinary(buffer, folder)
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple uploads failed: ${error.message}`);
  }
};

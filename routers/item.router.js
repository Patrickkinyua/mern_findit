import express from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  claimItem,
  resolveItem,
  verifyItem,
  unclaimItem,
  searchItems,
  getUserItems,
} from "../controllers/item.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { upload, handleUploadError } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public routes (no auth required)
router.get("/", getItems);                    // Get all items with filters
router.get("/search", searchItems);           // Search items
router.get("/user/:userId", getUserItems);   // Get items by user

// Protected routes (auth required)
router.post("/", authenticateToken, upload.array("images", 5), handleUploadError, createItem);           // Create item with images
router.get("/:id", getItemById);                           // Get item details (increments views)
router.put("/:id", authenticateToken, upload.array("images", 5), handleUploadError, updateItem);         // Update item with new images
router.delete("/:id", authenticateToken, deleteItem);      // Soft delete item (removes from Cloudinary)

// Claiming/Resolution routes
router.post("/:id/claim", authenticateToken, claimItem);    // Claim an item
router.post("/:id/unclaim", authenticateToken, unclaimItem); // Cancel claim
router.post("/:id/resolve", authenticateToken, resolveItem); // Resolve item

// Admin routes
router.post("/:id/verify", authenticateToken, verifyItem);  // Verify item (admin only)

export default router;

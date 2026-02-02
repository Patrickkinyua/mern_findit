import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { upload, handleUploadError } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", authenticateToken, getUsers);          // Admin
router.get("/:id", authenticateToken, getUserById);   // Owner or Admin
router.put("/:id", authenticateToken, upload.fields([
  { name: "profileimg", maxCount: 1 },
  { name: "coverimg", maxCount: 1 }
]), handleUploadError, updateUser);    // Owner
router.delete("/:id", authenticateToken, deleteUser); // Admin

export default router;

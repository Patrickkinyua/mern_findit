import User from "../models/user.model.js";
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.utils.js";


export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            users: users,
            count: users.length,
        });
    } catch (error) {
        console.error("Get Users Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching users",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const getUserById = async (req, res) => {
    const userId = req.params.id;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID format",
        });
    }

    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            user: user,
        });
    } catch (error) {
        console.error("Get User By Id Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching user",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID format",
        });
    }

    // Check authorization (user can only update themselves)
    if (userId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to update this user",
        });
    }

    const allowedFields = ["name", "bio", "link"];

    const updates = {};

    // Only copy allowed fields
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Handle profile image upload
    if (req.files && req.files.profileimg && req.files.profileimg[0]) {
      try {
        const user = await User.findById(userId);
        
        // Delete old profile image if exists
        if (user.profileimg) {
          const publicId = extractPublicId(user.profileimg);
          if (publicId) {
            await deleteFromCloudinary(`findit/profiles/${publicId}`);
          }
        }

        // Upload new profile image
        const uploadResult = await uploadToCloudinary(
          req.files.profileimg[0].buffer,
          "findit/profiles",
          `profile-${userId}`
        );
        updates.profileimg = uploadResult.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Profile image upload failed: " + uploadError.message,
        });
      }
    }

    // Handle cover image upload
    if (req.files && req.files.coverimg && req.files.coverimg[0]) {
      try {
        const user = await User.findById(userId);
        
        // Delete old cover image if exists
        if (user.coverimg) {
          const publicId = extractPublicId(user.coverimg);
          if (publicId) {
            await deleteFromCloudinary(`findit/covers/${publicId}`);
          }
        }

        // Upload new cover image
        const uploadResult = await uploadToCloudinary(
          req.files.coverimg[0].buffer,
          "findit/covers",
          `cover-${userId}`
        );
        updates.coverimg = uploadResult.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Cover image upload failed: " + uploadError.message,
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });

  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
export const deleteUser = async (req, res) => {
    const userId = req.params.id;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID format",
        });
    }

    // Check authorization (user can only delete themselves)
    if (userId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to delete this user",
        });
    }

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting user",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}
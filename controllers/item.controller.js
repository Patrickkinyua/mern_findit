import Item from "../models/item.model.js";
import User from "../models/user.model.js";
import { uploadMultipleToCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.utils.js";

// ✅ CREATE - Post a lost/found item
export const createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, dateOccurred, contactMethod } = req.body;

    // Validation
    if (!title || !description || !type || !location || !dateOccurred) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!["lost", "found"].includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be 'lost' or 'found'" });
    }

    // Handle image uploads to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await uploadMultipleToCloudinary(
          req.files.map((file) => file.buffer),
          "findit/items"
        );
        imageUrls = uploadResults.map((result) => result.secure_url);
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Image upload failed: " + uploadError.message,
        });
      }
    }

    // Create new item
    const newItem = await Item.create({
      title: title.trim(),
      description: description.trim(),
      type,
      category: category || "other",
      location: {
        name: location.name,
        latitude: location.latitude || null,
        longitude: location.longitude || null,
      },
      dateOccurred,
      contactMethod: contactMethod || "in-app",
      images: imageUrls,
      reportedBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Item posted successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Create Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔍 READ - Get all items with filters
export const getItems = async (req, res) => {
  try {
    const { type, category, isResolved, isVerified, limit = 20, page = 1 } = req.query;

    // Build filter object
    const filter = { isDeleted: false };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isResolved !== undefined) filter.isResolved = isResolved === "true";
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";

    const skip = (page - 1) * limit;

    const items = await Item.find(filter)
      .populate("reportedBy", "name email profileimg rating")
      .populate("claimedBy", "name email profileimg")
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Item.countDocuments(filter);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching items",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 📄 READ - Get single item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id)
      .populate("reportedBy", "name email profileimg rating bio")
      .populate("claimedBy", "name email profileimg");

    if (!item || item.isDeleted) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Increment views
    item.views += 1;
    await item.save();

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get Item By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✏️ UPDATE - Update item (only by poster or admin)
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, contactMethod } = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Check authorization (only poster can edit)
    if (item.reportedBy.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this item" });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      try {
        // Delete old images from Cloudinary
        for (const imageUrl of item.images) {
          const publicId = extractPublicId(imageUrl);
          if (publicId) {
            await deleteFromCloudinary(`findit/items/${publicId}`);
          }
        }

        // Upload new images
        const uploadResults = await uploadMultipleToCloudinary(
          req.files.map((file) => file.buffer),
          "findit/items"
        );
        item.images = uploadResults.map((result) => result.secure_url);
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Image upload failed: " + uploadError.message,
        });
      }
    }

    // Update allowed fields
    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (location) item.location = location;
    if (contactMethod) item.contactMethod = contactMethod;

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🗑️ DELETE - Soft delete item (only by poster or admin)
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Check authorization
    if (item.reportedBy.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this item" });
    }

    // Delete images from Cloudinary
    try {
      for (const imageUrl of item.images) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await deleteFromCloudinary(`findit/items/${publicId}`);
        }
      }
    } catch (deleteError) {
      console.error("Failed to delete images from Cloudinary:", deleteError);
      // Continue with soft delete even if image deletion fails
    }

    // Soft delete
    item.isDeleted = true;
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🎯 CLAIM - User claims a lost/found item
export const claimItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item || item.isDeleted) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    if (item.isResolved) {
      return res.status(400).json({ success: false, message: "Item is already resolved" });
    }

    if (item.claimedBy) {
      return res.status(400).json({ success: false, message: "Item is already claimed" });
    }

    // Claim the item
    item.claimedBy = req.user.userId;
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Item claimed successfully. Contact the poster to verify.",
      item,
    });
  } catch (error) {
    console.error("Claim Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while claiming item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ RESOLVE - Mark item as resolved (by poster or admin)
export const resolveItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { givenRating } = req.body; // Rating for the claimer

    const item = await Item.findById(id);
    if (!item || item.isDeleted) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Check authorization (only poster can resolve)
    if (item.reportedBy.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to resolve this item" });
    }

    if (!item.claimedBy) {
      return res.status(400).json({ success: false, message: "No one has claimed this item yet" });
    }

    // Mark as resolved
    item.isResolved = true;
    await item.save();

    // Update rating if provided
    if (givenRating) {
      const claimer = await User.findById(item.claimedBy);
      if (claimer) {
        // Simple rating average (in production, use a more robust system)
        claimer.rating = (claimer.rating + givenRating) / 2;
        await claimer.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Item resolved successfully",
      item,
    });
  } catch (error) {
    console.error("Resolve Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resolving item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 👨‍⚖️ VERIFY - Admin verification (admin only)
export const verifyItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item || item.isDeleted) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.isVerified = true;
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Item verified successfully",
      item,
    });
  } catch (error) {
    console.error("Verify Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔙 UNCLAIM - Claimer cancels their claim
export const unclaimItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item || item.isDeleted) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    if (!item.claimedBy) {
      return res.status(400).json({ success: false, message: "Item is not claimed" });
    }

    // Check authorization (only claimer can unclaim)
    if (item.claimedBy.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to unclaim this item" });
    }

    item.claimedBy = null;
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Claim cancelled successfully",
      item,
    });
  } catch (error) {
    console.error("Unclaim Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while unclaiming item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔎 SEARCH - Search items by title/description
export const searchItems = async (req, res) => {
  try {
    const { q, type, category } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Search query must be at least 2 characters" });
    }

    const filter = {
      isDeleted: false,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };

    if (type) filter.type = type;
    if (category) filter.category = category;

    const items = await Item.find(filter)
      .populate("reportedBy", "name email profileimg rating")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("Search Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching items",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 👤 GET USER ITEMS - Get items posted by a specific user
export const getUserItems = async (req, res) => {
  try {
    const { userId } = req.params;

    const items = await Item.find({
      reportedBy: userId,
      isDeleted: false,
    })
      .populate("reportedBy", "name email profileimg rating")
      .populate("claimedBy", "name email profileimg")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("Get User Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user items",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

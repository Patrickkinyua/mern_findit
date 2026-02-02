import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    // 👤 Who reported the item
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔹 Item Type
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
      index: true,
    },

    // 🔹 Basic Info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      enum: [
        "electronics",
        "documents",
        "clothing",
        "accessories",
        "books",
        "other",
      ],
      default: "other",
      index: true,
    },

    // 📍 Location Details
    location: {
      name: { type: String, required: true }, // e.g. "Library"
      latitude: { type: Number },
      longitude: { type: Number },
    },

    // 📅 When it happened
    dateOccurred: {
      type: Date,
      required: true,
    },

    // 🖼 Images
    images: [
      {
        type: String, // URL
      },
    ],

    // 📞 Contact Preference (privacy safe)
    contactMethod: {
      type: String,
      enum: ["in-app", "email", "phone"],
      default: "in-app",
    },

    // 🔐 Claiming system
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🔍 Verification by admin
    isVerified: {
      type: Boolean,
      default: false,
    },

    // 👁 Engagement
    views: {
      type: Number,
      default: 0,
    },

    // 🚫 Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;

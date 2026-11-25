
import mongoose from "mongoose";
import Business from "../models/Business.js";

// Get the authenticated user's business ID.
const getBusinessId = (user) => {
  return user.business?._id || user.business;
};

// GET BUSINESS PROFILE
export const getBusinessProfile = async (req, res) => {
  try {
    const businessId = getBusinessId(req.user);

    if (!businessId) {
      return res.status(404).json({
        success: false,
        message: "No business is associated with this account.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid business ID.",
      });
    }

    const business = await Business.findById(businessId).select("-__v");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    return res.status(200).json({
      success: true,
      business,
    });

  } catch (error) {
    console.error("Get business profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve business profile.",
    });
  }
};

// UPDATE BUSINESS PROFILE
export const updateBusinessProfile = async (req, res) => {
  try {
    // Only business owners can update business settings.
    if (req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the business owner can update settings.",
      });
    }

    const businessId = getBusinessId(req.user);

    if (!businessId) {
      return res.status(404).json({
        success: false,
        message: "No business is associated with this account.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid business ID.",
      });
    }

    // Only these fields can be updated.
    const allowedFields = [
      "name",
      "industry",
      "description",
      "contactEmail",
      "phone",
      "website",
      "address",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string.`,
          });
        }

        updates[field] = req.body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
    }

    // Business name cannot be empty.
    if (
      Object.prototype.hasOwnProperty.call(updates, "name") &&
      !updates.name
    ) {
      return res.status(400).json({
        success: false,
        message: "Business name cannot be empty.",
      });
    }

    // Validate contact email.
    if (updates.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(updates.contactEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid contact email.",
        });
      }

      updates.contactEmail = updates.contactEmail.toLowerCase();
    }

    // Validate phone number.
    if (
      updates.phone &&
      !/^[+()\d\s.-]{7,30}$/.test(updates.phone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    // Validate website URL.
    if (updates.website) {
      try {
        const website = /^https?:\/\//i.test(updates.website)
          ? updates.website
          : `https://${updates.website}`;

        const parsedUrl = new URL(website);

        if (
          !["http:", "https:"].includes(parsedUrl.protocol) ||
          !parsedUrl.hostname.includes(".")
        ) {
          throw new Error("Invalid website URL");
        }

        updates.website = parsedUrl.toString();

      } catch {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid website URL.",
        });
      }
    }

    // Update only the authenticated user's business.
    const business = await Business.findOneAndUpdate(
      { _id: businessId },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business profile updated successfully.",
      business,
    });

  } catch (error) {
    console.error("Update business profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update business profile.",
    });
  }
};

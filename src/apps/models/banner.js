const mongoose = require("../../common/init.mongo")();

const bannerSchema = new mongoose.Schema(
  {
    // Keep optional title for compatibility, not strictly required in existing DB
    title: { type: String },
    // Image file name or URL
    image: { type: String },
    // Link / URL when clicking the banner
    url: { type: String },
    // Legacy alias for some code paths
    link: { type: String },
    // Target for link (e.g. "_blank" or "_self")
    target: { type: String, default: "_self" },
    // Position / sort order integer
    position: { type: Number, default: 0 },
    // Whether the banner is published/visible
    publish: { type: Boolean, default: true },
    // Backwards-compatible fields (if used elsewhere)
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    order: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

const BannerModel = mongoose.model("Banners", bannerSchema, "banners");
module.exports = BannerModel;

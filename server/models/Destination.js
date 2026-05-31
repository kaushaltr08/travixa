const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required."],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: [true, "Destination slug is required."],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL friendly."],
    },
    state: {
      type: String,
      required: [true, "State is required."],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
      maxlength: 3000,
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required."],
      trim: true,
    },
    bestTimeToVisit: {
      type: String,
      required: [true, "Best time to visit is required."],
      trim: true,
    },
    budgetRange: {
      type: String,
      required: [true, "Budget range is required."],
      trim: true,
    },
    hiddenGems: {
      type: [String],
      default: [],
    },
    attractions: {
      type: [String],
      default: [],
    },
    localExperiences: {
      type: [String],
      default: [],
    },
    foodRecommendations: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

destinationSchema.index({ name: "text", state: "text", description: "text" });

module.exports = mongoose.model("Destination", destinationSchema);

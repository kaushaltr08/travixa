const mongoose = require("mongoose");

const attractionSchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Destination is required."],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Attraction title is required."],
      trim: true,
      maxlength: 160,
    },
    category: {
      type: String,
      required: [true, "Attraction category is required."],
      trim: true,
      maxlength: 80,
    },
    location: {
      type: String,
      required: [true, "Location is required."],
      trim: true,
      maxlength: 180,
    },
    entryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      required: [true, "Attraction image is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Attraction description is required."],
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

attractionSchema.index({ title: "text", category: "text", location: "text" });

module.exports = mongoose.model("Attraction", attractionSchema);

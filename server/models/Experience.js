const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Destination is required."],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Experience title is required."],
      trim: true,
      maxlength: 160,
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
      required: [true, "Image is required."],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", experienceSchema);

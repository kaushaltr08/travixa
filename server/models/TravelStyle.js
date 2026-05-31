const mongoose = require("mongoose");

const travelStyleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Travel style name is required."],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, "Icon is required."],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TravelStyle", travelStyleSchema);

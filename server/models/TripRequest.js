const mongoose = require("mongoose");

const tripRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
      index: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Destination is required."],
      index: true,
    },
    budget: {
      type: Number,
      required: [true, "Budget is required."],
      min: 0,
    },
    days: {
      type: Number,
      required: [true, "Number of days is required."],
      min: 1,
      max: 60,
    },
    travelStyle: {
      type: String,
      required: [true, "Travel style is required."],
      trim: true,
    },
    season: {
      type: String,
      required: [true, "Season is required."],
      trim: true,
    },
    travelPartner: {
      type: String,
      required: [true, "Travel partner is required."],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripRequest", tripRequestSchema);

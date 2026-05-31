const mongoose = require("mongoose");

const generatedTripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
      index: true,
    },
    tripRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripRequest",
      required: [true, "Trip request is required."],
      index: true,
    },
    totalBudget: {
      type: Number,
      required: [true, "Total budget is required."],
      min: 0,
    },
    totalDays: {
      type: Number,
      required: [true, "Total days is required."],
      min: 1,
    },
    itinerary: {
      type: [
        {
          day: Number,
          title: String,
          summary: String,
          activities: [String],
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GeneratedTrip", generatedTripSchema);

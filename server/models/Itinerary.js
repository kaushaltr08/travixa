const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    time: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const dayPlanSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    activities: {
      type: [activitySchema],
      default: [],
    },
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
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
    dayPlans: {
      type: [dayPlanSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Itinerary", itinerarySchema);

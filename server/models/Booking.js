const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: [
        "flights",
        "hotels",
        "homestays",
        "holiday-packages",
        "trains",
        "buses",
        "cabs",
        "activities",
        "visa",
        "forex",
        "insurance",
        "cruises",
      ],
    },
    customerName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    from: {
      type: String,
      trim: true,
      default: "",
    },
    to: {
      type: String,
      trim: true,
      default: "",
    },
    departureDate: {
      type: Date,
    },
    returnDate: {
      type: Date,
    },
    travellers: {
      type: Number,
      default: 1,
      min: 1,
    },
    classType: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid", "failed"],
      default: "not_required",
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INR",
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      default: "",
    },
    razorpaySignature: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

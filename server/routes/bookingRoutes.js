const express = require("express");
const crypto = require("crypto");
const Booking = require("../models/Booking");

const router = express.Router();

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are missing in server/config.env.");
  }

  return { keyId, keySecret };
};

const createRazorpayOrder = async ({ amount, currency, receipt, notes }) => {
  const { keyId, keySecret } = getRazorpayCredentials();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      notes,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.description || "Unable to create Razorpay order.");
  }

  return result;
};

router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/razorpay/order", async (req, res) => {
  try {
    const { amount, currency = "INR", booking } = req.body;
    const amountInRupees = Number(amount);

    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      return res.status(400).json({ success: false, message: "A valid booking amount is required." });
    }

    if (!booking?.module || !booking?.customerName || !booking?.email || !booking?.phone) {
      return res.status(400).json({ success: false, message: "Booking details are required." });
    }

    const createdBooking = await Booking.create({
      ...booking,
      amount: amountInRupees,
      currency,
      paymentStatus: "pending",
    });

    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(amountInRupees * 100),
      currency,
      receipt: `booking_${createdBooking._id}`,
      notes: {
        bookingId: String(createdBooking._id),
        module: createdBooking.module,
        customerName: createdBooking.customerName,
      },
    });

    createdBooking.razorpayOrderId = razorpayOrder.id;
    await createdBooking.save();

    res.status(201).json({
      success: true,
      data: {
        bookingId: createdBooking._id,
        keyId: process.env.RAZORPAY_KEY_ID,
        order: razorpayOrder,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/razorpay/verify", async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;
    const { keySecret } = getRazorpayCredentials();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (!booking.razorpayOrderId || booking.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Payment order mismatch." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${booking.razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      booking.paymentStatus = "failed";
      await booking.save();
      return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    booking.paymentStatus = "paid";
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

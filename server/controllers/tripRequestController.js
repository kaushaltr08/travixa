const TripRequest = require("../models/TripRequest");
const Destination = require("../models/Destination");
const mongoose = require("mongoose");

const resolveDestinationId = async (destination) => {
  if (mongoose.isValidObjectId(destination)) {
    return destination;
  }

  const normalizedDestination = String(destination || "").trim();
  const slug = normalizedDestination.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const escapedDestination = normalizedDestination.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const destinationDoc = await Destination.findOne({
    $or: [{ slug }, { name: new RegExp(`^${escapedDestination}$`, "i") }],
  });

  return destinationDoc?._id;
};

const getTripRequests = async (req, res) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const tripRequests = await TripRequest.find(filter)
      .populate("userId", "name email role")
      .populate("destination", "name slug state coverImage budgetRange")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tripRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTripRequest = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id)
      .populate("userId", "name email role")
      .populate("destination", "name slug state coverImage budgetRange");

    if (!tripRequest) {
      return res.status(404).json({ success: false, message: "Trip request not found." });
    }

    res.json({ success: true, data: tripRequest });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const createTripRequest = async (req, res) => {
  try {
    const destinationId = await resolveDestinationId(req.body.destination);

    if (!destinationId) {
      return res.status(400).json({
        success: false,
        message: "Destination must match an existing Travixa destination.",
      });
    }

    const tripRequest = await TripRequest.create({
      ...req.body,
      destination: destinationId,
    });
    const populatedTripRequest = await tripRequest.populate([
      { path: "userId", select: "name email role" },
      { path: "destination", select: "name slug state coverImage budgetRange" },
    ]);

    res.status(201).json({ success: true, data: populatedTripRequest });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateTripRequest = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "name email role")
      .populate("destination", "name slug state coverImage budgetRange");

    if (!tripRequest) {
      return res.status(404).json({ success: false, message: "Trip request not found." });
    }

    res.json({ success: true, data: tripRequest });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteTripRequest = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id);

    if (!tripRequest) {
      return res.status(404).json({ success: false, message: "Trip request not found." });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = tripRequest.userId?.toString() === req.user?._id?.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own trip requests.",
      });
    }

    await tripRequest.deleteOne();

    res.json({ success: true, data: tripRequest });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTripRequests,
  getTripRequest,
  createTripRequest,
  updateTripRequest,
  deleteTripRequest,
};

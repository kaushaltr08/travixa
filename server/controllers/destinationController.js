const Destination = require("../models/Destination");
const mongoose = require("mongoose");

const getDestinations = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search ? { $text: { $search: search } } : {};
    const destinations = await Destination.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, data: destinations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDestination = async (req, res) => {
  try {
    const filters = [{ slug: req.params.id }];
    if (mongoose.isValidObjectId(req.params.id)) {
      filters.push({ _id: req.params.id });
    }

    const destination = await Destination.findOne({ $or: filters });

    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found." });
    }

    res.json({ success: true, data: destination });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({ success: true, data: destination });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found." });
    }

    res.json({ success: true, data: destination });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found." });
    }

    res.json({ success: true, data: destination });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
};

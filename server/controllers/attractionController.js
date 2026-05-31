const Attraction = require("../models/Attraction");

const getAttractions = async (req, res) => {
  try {
    const filter = req.query.destinationId ? { destinationId: req.query.destinationId } : {};
    const attractions = await Attraction.find(filter)
      .populate("destinationId", "name slug state")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: attractions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id).populate(
      "destinationId",
      "name slug state"
    );

    if (!attraction) {
      return res.status(404).json({ success: false, message: "Attraction not found." });
    }

    res.json({ success: true, data: attraction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const createAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.create(req.body);
    const populatedAttraction = await attraction.populate("destinationId", "name slug state");

    res.status(201).json({ success: true, data: populatedAttraction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("destinationId", "name slug state");

    if (!attraction) {
      return res.status(404).json({ success: false, message: "Attraction not found." });
    }

    res.json({ success: true, data: attraction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findByIdAndDelete(req.params.id);

    if (!attraction) {
      return res.status(404).json({ success: false, message: "Attraction not found." });
    }

    res.json({ success: true, data: attraction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAttractions,
  getAttraction,
  createAttraction,
  updateAttraction,
  deleteAttraction,
};

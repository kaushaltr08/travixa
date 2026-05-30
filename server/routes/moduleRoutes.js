const express = require("express");
const TravelModule = require("../models/TravelModule");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const modules = await TravelModule.find().sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: modules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const module = await TravelModule.create(req.body);
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require("express");
const {
  getTripRequests,
  getTripRequest,
  createTripRequest,
  updateTripRequest,
  deleteTripRequest,
} = require("../controllers/tripRequestController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(getTripRequests).post(createTripRequest);
router
  .route("/:id")
  .get(getTripRequest)
  .put(protect, authorize("admin"), updateTripRequest)
  .delete(protect, deleteTripRequest);

module.exports = router;

const express = require("express");
const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
} = require("../controllers/destinationController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(getDestinations).post(protect, authorize("admin"), createDestination);
router
  .route("/:id")
  .get(getDestination)
  .put(protect, authorize("admin"), updateDestination)
  .delete(protect, authorize("admin"), deleteDestination);

module.exports = router;

const express = require("express");
const GeneratedTrip = require("../models/GeneratedTrip");
const createCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();
const controller = createCrudController(GeneratedTrip, {
  populate: [
    { path: "userId", select: "name email role" },
    { path: "tripRequestId", populate: { path: "destination", select: "name slug state" } },
  ],
});

router.route("/").get(protect, controller.getAll).post(protect, controller.create);
router
  .route("/:id")
  .get(protect, controller.getOne)
  .put(protect, authorize("admin"), controller.update)
  .delete(protect, authorize("admin"), controller.remove);

module.exports = router;

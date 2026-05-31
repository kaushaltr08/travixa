const express = require("express");
const Experience = require("../models/Experience");
const createCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();
const controller = createCrudController(Experience, {
  populate: [{ path: "destinationId", select: "name slug state" }],
});

router.route("/").get(controller.getAll).post(protect, authorize("admin"), controller.create);
router
  .route("/:id")
  .get(controller.getOne)
  .put(protect, authorize("admin"), controller.update)
  .delete(protect, authorize("admin"), controller.remove);

module.exports = router;

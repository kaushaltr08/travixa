const express = require("express");
const TravelStyle = require("../models/TravelStyle");
const createCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();
const controller = createCrudController(TravelStyle);

router.route("/").get(controller.getAll).post(protect, authorize("admin"), controller.create);
router
  .route("/:id")
  .get(controller.getOne)
  .put(protect, authorize("admin"), controller.update)
  .delete(protect, authorize("admin"), controller.remove);

module.exports = router;

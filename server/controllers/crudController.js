const createCrudController = (Model, options = {}) => {
  const populate = options.populate || [];

  const applyPopulate = (query) => {
    populate.forEach((item) => {
      query.populate(item);
    });
    return query;
  };

  return {
    getAll: async (req, res) => {
      try {
        const docs = await applyPopulate(Model.find()).sort({ createdAt: -1 });
        res.json({ success: true, data: docs });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },
    getOne: async (req, res) => {
      try {
        const doc = await applyPopulate(Model.findById(req.params.id));

        if (!doc) {
          return res.status(404).json({ success: false, message: "Resource not found." });
        }

        res.json({ success: true, data: doc });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
    },
    create: async (req, res) => {
      try {
        const doc = await Model.create(req.body);
        res.status(201).json({ success: true, data: doc });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
    },
    update: async (req, res) => {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!doc) {
          return res.status(404).json({ success: false, message: "Resource not found." });
        }

        res.json({ success: true, data: doc });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
    },
    remove: async (req, res) => {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
          return res.status(404).json({ success: false, message: "Resource not found." });
        }

        res.json({ success: true, data: doc });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
    },
  };
};

module.exports = createCrudController;

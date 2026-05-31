require("dotenv").config({ path: "./config.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const attractionRoutes = require("./routes/attractionRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const generatedTripRoutes = require("./routes/generatedTripRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const tripRequestRoutes = require("./routes/tripRequestRoutes");
const travelStyleRoutes = require("./routes/travelStyleRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Travixa API Running");
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Travixa API healthy" });
});

app.use("/api/bookings", bookingRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/attractions", attractionRoutes);
app.use("/api/trip-requests", tripRequestRoutes);
app.use("/api/trip-planner", tripRequestRoutes);
app.use("/api/generated-trips", generatedTripRoutes);
app.use("/api/travel-styles", travelStyleRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  });

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const bookingsRoutes = require("./routes/bookingsRoutes");



const app = express();

app.use(cors());
app.use(express.json());
// Booking APIs
app.use("/book", bookingRoutes);
app.use("/bookings", bookingsRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Ticket Booking API running 🚀" });
});

app.use("/events", eventRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

const express = require("express");
const router = express.Router();

const { listBookings } = require("../controllers/bookingController");

// GET /bookings -> list all bookings
router.get("/", listBookings);

module.exports = router;

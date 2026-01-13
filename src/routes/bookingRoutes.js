const express = require("express");
const router = express.Router();

// Import booking controller
const { createBooking } = require("../controllers/bookingController");

/**
 * POST /book
 * Creates a booking safely (no overselling)
 */
router.post("/", createBooking);

module.exports = router;

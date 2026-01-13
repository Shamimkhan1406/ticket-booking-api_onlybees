const mongoose = require("mongoose");
const Event = require("../models/Event");
const Booking = require("../models/Booking");

// CREATE BOOKING CONTROLLER
// This endpoint must be concurrency-safe.
// It should NEVER allow overselling even if multiple users book at the same time.
exports.createBooking = async (req, res) => {
  try {
    // Read required fields from request body
    const { eventId, sectionId, qty } = req.body;

    // Basic validation: ensure all fields exist
    if (!eventId || !sectionId || !qty) {
      return res.status(400).json({
        message: "eventId, sectionId, qty are required",
      });
    }

    // qty must be a positive number
    if (qty <= 0) {
      return res.status(400).json({
        message: "qty must be >= 1",
      });
    }

    /**
     * 🔒 CONCURRENCY-SAFE LOCKING STRATEGY (Atomic Update)
     *
     * We use MongoDB's atomic operation using findOneAndUpdate().
     * This ensures the check + update happens in ONE step.
     *
     * Condition:
     * - Event must exist
     * - sectionId must match a section inside the event
     * - remaining tickets must be >= qty
     *
     * If condition is true:
     * - decrement remaining by qty
     *
     * If condition is false:
     * - update does not happen => no overselling possible
     */
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId, // match event
        "sections._id": sectionId, // match section inside event
        "sections.remaining": { $gte: qty }, // ensure enough tickets remain
      },
      {
        // Decrease remaining tickets safely
        $inc: { "sections.$.remaining": -qty },
      },
      {
        // Return updated document after update
        new: true,
      }
    );

    // If updatedEvent is null:
    // means either event/section doesn't exist OR not enough tickets left
    if (!updatedEvent) {
      return res.status(409).json({
        message: "Not enough tickets available (or invalid event/section)",
      });
    }

    /**
     * Now that remaining has been safely reduced,
     * we create a Booking document to record the successful booking.
     */
    const booking = await Booking.create({
      eventId: new mongoose.Types.ObjectId(eventId),
      sectionId: new mongoose.Types.ObjectId(sectionId),
      qty,
    });

    // Return success response
    return res.status(201).json({
      message: "Booking successful ✅",
      booking,
    });
  } catch (error) {
    // Catch any unexpected server errors
    return res.status(500).json({
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// LIST BOOKINGS CONTROLLER
// Returns all bookings along with event details (using populate)
exports.listBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("eventId", "name sections")
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => {
      const event = b.eventId;

      const section = event?.sections?.find(
        (s) => s._id.toString() === b.sectionId.toString()
      );

      return {
        _id: b._id,
        qty: b.qty,
        createdAt: b.createdAt,
        event: event ? { _id: event._id, name: event.name } : null,
        section: section
          ? { _id: section._id, name: section.name, price: section.price }
          : null,
      };
    });

    return res.status(200).json({
      total: formatted.length,
      bookings: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

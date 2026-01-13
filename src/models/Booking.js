const mongoose = require("mongoose");

// Booking Schema:
// Stores each successful booking attempt.
// This is a record of how many tickets were booked for a specific event section.
const bookingSchema = new mongoose.Schema(
  {
    // Reference to the Event document
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // Stores the sectionId (subdocument _id inside Event.sections array)
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Quantity of tickets booked
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);

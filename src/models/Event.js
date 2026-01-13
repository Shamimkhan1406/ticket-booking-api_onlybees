const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    remaining: { type: Number, required: true },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);

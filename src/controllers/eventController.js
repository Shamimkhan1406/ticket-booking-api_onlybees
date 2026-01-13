const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    const { name, sections } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Event name is required" });
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ message: "At least 1 section is required" });
    }

    const normalizedSections = sections.map((s) => ({
      name: s.name,
      price: s.price,
      capacity: s.capacity,
      remaining: s.remaining ?? s.capacity,
    }));

    const event = await Event.create({
      name,
      sections: normalizedSections,
    });

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating event",
      error: error.message,
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ event });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching event",
      error: error.message,
    });
  }
};

const express = require("express");
const router = express.Router();

const { createEvent, getEventById } = require("../controllers/eventController");


router.post("/create", createEvent);
router.get("/:id", getEventById);


module.exports = router;

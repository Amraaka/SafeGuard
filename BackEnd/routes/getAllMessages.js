const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Route to fetch all messages
router.get("/all", async (req, res) => {
  try {
    const messages = await Message.find(); // Fetch all messages from the database
    res.status(200).json(messages); // Send messages as JSON response
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { MessagingResponse } = require("twilio").twiml;
const mongoose = require("mongoose");

// GET all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Twilio webhook endpoint for incoming messages
router.post("/webhook", async (req, res) => {
  try {
    const {
      Body: body,
      From: from,
      To: to,
      MessageSid: messageSid,
      NumMedia: numMedia,
    } = req.body;

    const mediaUrls = [];

    if (parseInt(numMedia) > 0) {
      for (let i = 0; i < parseInt(numMedia); i++) {
        mediaUrls.push(req.body[`MediaUrl${i}`]);
      }
    }

    const message = new Message({
      body,
      from,
      to,
      messageSid,
      numMedia: parseInt(numMedia) || 0,
      mediaUrls,
    });

    await message.save();

    const twiml = new MessagingResponse();
    twiml.message("Message received and stored!");

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());

    console.log(`New message stored: ${messageSid}`);
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).send("Error processing message");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (err) {
    console.error("Error fetching message:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch message",
      error: err.message || "An error occurred",
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message || "An error occurred",
    });
  }
});

router.post("/send", async (req, res) => {
  try {
    const { to, body } = req.body;

    if (!to || !body) {
      return res.status(400).json({
        success: false,
        message: "Both 'to' phone number and message 'body' are required",
      });
    }

    const twilioClient = require("twilio")(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const twilioResponse = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    res.status(201).json({
      success: true,
      message: "SMS sent successfully",
      sid: twilioResponse.sid,
      status: twilioResponse.status,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message || "An error occurred",
    });
  }
});

router.post("/call", async (req, res) => {
  try {
    const to = "+97685114648";
    const from = process.env.TWILIO_PHONE_NUMBER;

    const twilioClient = require("twilio")(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const call = await twilioClient.calls.create({
      to,
      from,
      url: "https://766d-202-55-188-85.ngrok-free.app/voice.xml",
    });

    res.status(201).json({
      success: true,
      message: "Call initiated successfully",
      callSid: call.sid,
      status: call.status,
    });
  } catch (error) {
    console.error("Error initiating call:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate call",
      error: error.message || "An error occurred",
    });
  }
});

module.exports = router;

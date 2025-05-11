const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { MessagingResponse } = require("twilio").twiml;
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch messages",
      error: err.message
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      messages
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

router.post("/webhook", async (req, res) => {
  try {
    const {
      Body: body,
      From: from,
      To: to,
      MessageSid: messageSid,
      NumMedia: numMedia,
    } = req.body;
    console.log("Received message:", req.body);

    // Save incoming message to database
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
    
    // Get the verified phone number from environment variables
    const VERIFIED_PHONE_NUMBER = process.env.VERIFIED_PHONE_NUMBER;
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
    
    // Auto-forward the message to a verified phone number
    if (VERIFIED_PHONE_NUMBER && VERIFIED_PHONE_NUMBER.trim() !== '') {
      // Check if Twilio credentials are available
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.error("Twilio credentials missing - message not forwarded");
      } else {
        try {
          // Initialize Twilio client
          const twilioClient = require("twilio")(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          
          // Construct the forwarded message
          const forwardMsg = `${from}-с ирсэн мессэж: ${body}`;
          
          console.log(`Attempting to forward message to ${VERIFIED_PHONE_NUMBER} from ${TWILIO_PHONE_NUMBER}`);
          
          // Forward the message
          const twilioResponse = await twilioClient.messages.create({
            body: forwardMsg,
            from: TWILIO_PHONE_NUMBER, // Use the Twilio phone number here, not 'to'
            to: VERIFIED_PHONE_NUMBER,
            mediaUrl: mediaUrls.length > 0 ? mediaUrls : undefined
          });
          
          // Save forwarded message to database
          const forwardedMessage = new Message({
            body: forwardMsg,
            from: TWILIO_PHONE_NUMBER,
            to: VERIFIED_PHONE_NUMBER,
            messageSid: twilioResponse.sid,
            numMedia: mediaUrls.length,
            mediaUrls: mediaUrls.length > 0 ? mediaUrls : [],
          });
          await forwardedMessage.save();
          
          console.log(`Message forwarded successfully: ${twilioResponse.sid}`);
        } catch (fwdError) {
          // Log forwarding error but don't fail the whole request
          console.error("Error forwarding message:", fwdError);
        }
      }
    } else {
      console.log("No verified phone number set - message not forwarded");
    }

    // Send empty TwiML response to avoid Twilio auto-reply
    const twiml = new MessagingResponse();
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());

    console.log(`New message received and processed: ${messageSid}`);
  } catch (err) {
    console.error("Error processing message:", err);
    res.status(500).json({
      success: false,
      message: "Error processing message",
      error: err.message
    });
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

    res.status(200).json({
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

router.post("/send", async (req, res) => {
  try {
    const { to, body } = req.body;

    if (!to || !body) {
      return res.status(400).json({
        success: false,
        message: "Both 'to' phone number and message 'body' are required",
      });
    }

    // Check if Twilio credentials are available
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return res.status(500).json({
        success: false,
        message: "Twilio credentials are not properly configured",
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

    // Store the message in the database
    const message = new Message({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      messageSid: twilioResponse.sid,
    });
    await message.save();
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
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required to make a call",
      });
    }
    
    // Check if required environment variables are present
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return res.status(500).json({
        success: false,
        message: "Twilio credentials are not properly configured",
      });
    }

    const from = process.env.TWILIO_PHONE_NUMBER;
    const twilioClient = require("twilio")(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // You need to provide a publicly accessible URL to your voice TwiML
    // For development, consider using ngrok to expose your local endpoint
    const callWebhookUrl = process.env.CALL_WEBHOOK_URL || "https://your-ngrok-url.ngrok-free.app/voice.xml";

    const call = await twilioClient.calls.create({
      to,
      from,
      url: callWebhookUrl,
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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      deletedMessage,
    });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: err.message || "An error occurred",
    });
  }
});

module.exports = router;
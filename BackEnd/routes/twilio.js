const express = require("express");
const router = express.Router();
const Message = require("./models/Message");

router.post("/webhook", async (req, res) => {
  try {
    const { MessageSid, From, To, Body, NumMedia = 0 } = req.body;

    if (!MessageSid || !From || !To || !Body) {
      return res.status(400).send("Missing required fields");
    }

    const existingMessage = await Message.findOne({ messageSid: MessageSid });
    if (existingMessage) {
      return res.status(400).send("Message already exists");
    }

    const numMedia = isNaN(parseInt(NumMedia)) ? 0 : parseInt(NumMedia);
    const message = new Message({
      messageSid: MessageSid,
      from: From,
      to: To,
      body: Body,
      numMedia,
      status: "received",
    });

    if (numMedia > 0) {
      const mediaUrls = [];
      for (let i = 0; i < numMedia; i++) {
        mediaUrls.push(req.body[`MediaUrl${i}`]);
      }
      message.mediaUrls = mediaUrls;
    }

    await message.save();
    console.log(`Message saved: ${MessageSid}`);

    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Message>Thank you! Your message has been received.</Message>
      </Response>
    `);
  } catch (error) {
    console.error("Error storing message:", error);
    res.status(500).send("Error processing message");
  }
});

router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

module.exports = router;

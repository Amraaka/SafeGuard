const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { MessagingResponse } = require('twilio').twiml;

// GET all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Twilio webhook endpoint for incoming messages
router.post('/webhook', async (req, res) => {
  try {
    // Extract message data from Twilio's request
    const {
      Body: body,
      From: from, 
      To: to,
      MessageSid: messageSid,
      NumMedia: numMedia
    } = req.body;
    
    // Array to store media URLs if any
    const mediaUrls = [];
    
    // If media is attached, collect URLs
    if (parseInt(numMedia) > 0) {
      for (let i = 0; i < parseInt(numMedia); i++) {
        mediaUrls.push(req.body[`MediaUrl${i}`]);
      }
    }
    
    // Create new message document
    const message = new Message({
      body,
      from,
      to,
      messageSid,
      numMedia: parseInt(numMedia) || 0,
      mediaUrls
    });
    
    // Save message to database
    await message.save();
    
    // Create TwiML response (optional - you can respond to the message)
    const twiml = new MessagingResponse();
    twiml.message('Message received and stored!');
    
    // Send TwiML response back to Twilio
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
    
    console.log(`New message stored: ${messageSid}`);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).send('Error processing message');
  }
});

// GET a specific message by ID
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
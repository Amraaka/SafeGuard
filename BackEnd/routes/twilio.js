// const express = require('express');
// const router = express.Router();
// const Message = require('../models/Message'); 

// router.post('/webhook', async (req, res) => {
//   try {
//     const {
//       MessageSid,
//       From,
//       To,
//       Body,
//       NumMedia = 0
//     } = req.body;
    
//     const message = new Message({
//       messageSid: MessageSid,
//       from: From,
//       to: To,
//       body: Body,
//       numMedia: parseInt(NumMedia),
//       status: 'received'
//     });
    
//     if (parseInt(NumMedia) > 0) {
//       const mediaUrls = [];
//       for (let i = 0; i < parseInt(NumMedia); i++) {
//         mediaUrls.push(req.body[`MediaUrl${i}`]);
//       }
//       message.mediaUrls = mediaUrls;
//     }
    
//     await message.save();
//     console.log(`Message saved: ${MessageSid}`);
    
//     res.set('Content-Type', 'text/xml');
//     res.send(`
//       <Response>
//         <Message>Thank you! Your message has been received.</Message>
//       </Response>
//     `);
    
//   } catch (error) {
//     console.error('Error storing message:', error);
//     res.status(500).send('Error processing message');
//   }
// });

// router.get('/messages', async (req, res) => {
//   try {
//     const messages = await Message.find().sort({ timestamp: -1 });
//     res.json(messages);
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     res.status(500).json({ error: 'Failed to retrieve messages' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const twilio = require('twilio');

// Get Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const homeownerNumber = process.env.HOMEOWNER_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Process incoming SMS webhook
router.post('/webhook', async (req, res) => {
  try {
    const {
      MessageSid,
      From,
      To,
      Body,
      NumMedia = 0
    } = req.body;
    
    // Create and save the message to the database
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
    
    // Check if this is a fire or smoke alert message
    if (Body.toLowerCase().includes('гал') || Body.toLowerCase().includes('утаа') || 
        Body.toLowerCase().includes('fire') || Body.toLowerCase().includes('smoke')) {
      
      // Log the alert
      console.log('ALERT: Fire or smoke detected!');
      
      // Call the homeowner
      try {
        const call = await client.calls.create({
          url: `${process.env.SERVER_URL}/api/twilio/emergency-twiml`,
          to: homeownerNumber,
          from: twilioNumber
        });
        console.log(`Emergency call initiated: ${call.sid}`);
      } catch (callError) {
        console.error('Error making emergency call:', callError);
      }
    }
    
    // Send response back to Twilio
    res.set('Content-Type', 'text/xml');
    res.send(`
      <Response>
        <Message>Мэдээлэл хүлээн авлаа! Мессеж хадгалагдсан.</Message>
      </Response>
    `);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).send('Error processing message');
  }
});

// Route to provide TwiML instructions for emergency calls
router.get('/emergency-twiml', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(`
    <Response>
      <Say language="mn-MN">Анхааруулга! Таны гэрт гал эсвэл утаа илэрлээ. Яаралтай шалгана уу.</Say>
      <Pause length="1"/>
      <Say language="en-US">Warning! Fire or smoke has been detected in your home. Please check immediately.</Say>
      <Pause length="2"/>
      <Say language="mn-MN">Энэ нь автомат дуудлага юм. Хэрэв та яаралтай тусламж хэрэгтэй бол 101 руу залгана уу.</Say>
      <Say language="en-US">This is an automated call. If you need emergency assistance, please call 101.</Say>
    </Response>
  `);
});

// Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

module.exports = router;

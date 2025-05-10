// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const connectDB = require('./config/db');
// const PORT = process.env.PORT || 3000;

// const app = express(); 

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json());

// connectDB();

// app.use('/api/twilio', require('./routes/twilio'));

// app.get('/', (req, res) => {
//   res.send('Hello from Express with MongoDB!');
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });






require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const twilioRoutes = require('./routes/twilio');

// Use routes
app.use('/api/twilio', twilioRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.send('SafeGuard API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





// const express = require('express');
// const router = express.Router();
// const Message = require('./models/Message');
// const twilio = require('./routes/twilio');

// // Get Twilio credentials from environment variables
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
// const homeownerNumber = process.env.HOMEOWNER_PHONE_NUMBER;
// require('dotenv').config();
// // Initialize Twilio client
// const client = twilio(accountSid, authToken);

// // Process incoming SMS webhook
// router.post('/webhook', async (req, res) => {
//   try {
//     const {
//       MessageSid,
//       From,
//       To,
//       Body,
//       NumMedia = 0
//     } = req.body;
    
//     // Create and save the message to the database
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
    
//     // Check if this is a fire or smoke alert message
//     if (Body.toLowerCase().includes('гал') || Body.toLowerCase().includes('утаа') || 
//         Body.toLowerCase().includes('fire') || Body.toLowerCase().includes('smoke')) {
      
//       // Log the alert
//       console.log('ALERT: Fire or smoke detected!');
      
//       // Call the homeowner
//       try {
//         const call = await client.calls.create({
//           url: 'http://your-server-domain.com/api/twilio/emergency-twiml',
//           to: homeownerNumber,
//           from: twilioNumber
//         });
//         console.log(`Emergency call initiated: ${call.sid}`);
//       } catch (callError) {
//         console.error('Error making emergency call:', callError);
//       }
//     }
    
//     // Send response back to Twilio
//     res.set('Content-Type', 'text/xml');
//     res.send(`
//       <Response>
//         <Message>Мэдээлэл хүлээн авлаа! Мессеж хадгалагдсан.</Message>
//       </Response>
//     `);
    
//   } catch (error) {
//     console.error('Error processing message:', error);
//     res.status(500).send('Error processing message');
//   }
// });

// // Route to provide TwiML instructions for emergency calls
// router.get('/emergency-twiml', (req, res) => {
//   res.set('Content-Type', 'text/xml');
//   res.send(`
//     <Response>
//       <Say language="mn-MN">Анхааруулга! Таны гэрт гал эсвэл утаа илэрлээ. Яаралтай шалгана уу.</Say>
//       <Pause length="1"/>
//       <Say language="en-US">Warning! Fire or smoke has been detected in your home. Please check immediately.</Say>
//       <Pause length="2"/>
//       <Say language="mn-MN">Энэ нь автомат дуудлага юм. Хэрэв та яаралтай тусламж хэрэгтэй бол 101 руу залгана уу.</Say>
//       <Say language="en-US">This is an automated call. If you need emergency assistance, please call 101.</Say>
//     </Response>
//   `);
// });

// // Get all messages
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
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Message content
  body: {
    type: String,
    required: true
  },
  
  // Twilio message SID
  messageSid: {
    type: String,
    unique: true
  },
  
  // Phone number that sent the message
  from: {
    type: String,
    required: true
  },
  
  // Phone number that received the message
  to: {
    type: String,
    required: true
  },
  
  // Additional Twilio metadata
  numMedia: {
    type: Number,
    default: 0
  },
  
  // Media URLs if any
  mediaUrls: [{
    type: String
  }],
  
  // Creation timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
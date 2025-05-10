const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageSid: String,
  from: String,
  to: String,
  body: String,
  numMedia: Number,
  mediaUrls: [String],
  status: String,
  direction: {
    type: String,
    default: 'inbound'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
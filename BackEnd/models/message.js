// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   messageSid: String,
//   from: String,
//   to: String,
//   body: String,
//   numMedia: Number,
//   mediaUrls: [String],
//   status: String,
//   direction: {
//     type: String,
//     default: 'inbound'
//   },
//   timestamp: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// const Message = mongoose.model('Message', messageSchema);

// module.exports = Message;
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageSid: {
    type: String,
    required: true,
    unique: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  numMedia: {
    type: Number,
    default: 0
  },
  mediaUrls: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['received', 'processed', 'error'],
    default: 'received'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
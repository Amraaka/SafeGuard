// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const messageRoutes = require('./routes/messageRoutes');
// require('./messageWatcher');

// dotenv.config();

// const app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => console.error('MongoDB connection error:', err));
// app.use('/api/messages', messageRoutes);

// app.get('/', (req, res) => {
//   res.send('Twilio Webhook Server is running!');
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something went wrong!');
// });

// const cors = require('cors');

// // Enable CORS for all origins
// app.use(cors());
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const messageRoutes = require('./routes/messageRoutes');

dotenv.config();

const app = express();

// Improved CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/messages', messageRoutes);

// Root route for server status checks
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Twilio Webhook Server is running!'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false })); // For Twilio's form data
app.use(express.json());

const app = express();
connectDB();

app.use('/api/twilio', require('./routes/twilio'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Express with MongoDB!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
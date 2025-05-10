require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const app = express(); 
const PORT = process.env.PORT || 3000;

connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/twilio', require('./routes/twilio'));

app.get('/', (req, res) => {
  res.send('Hello from Express with MongoDB!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

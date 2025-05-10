const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const messageRoutes = require("./routes/messageRoutes");
const getAllMessagesRoute = require("./routes/getAllMessages");
require("./messageWatcher");

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/messages", messageRoutes);

// Use the new route for fetching all messages
app.use("/api/allMes", getAllMessagesRoute);

app.get("/", (req, res) => {
  res.send("Twilio Webhook Server is running!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const cors = require("cors");

// Enable CORS for all origins
app.use(cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

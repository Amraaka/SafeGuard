require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const Message = require("./models/Message");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  console.log("Webhook received:", req.body);

  try {
    const { From, To, Body } = req.body;

    const message = new Message({
      from: From,
      to: To,
      body: Body || ""
    });

    await message.save();
    console.log("Message saved to database:", message);

    // Respond to Twilio
    res.set("Content-Type", "text/xml");
    res.send("<Response></Response>");
  } catch (error) {
    console.error("Error saving message to database:", error);
    res.status(500).send("Error processing webhook");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
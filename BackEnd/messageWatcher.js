const axios = require("axios");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const dotenv = require("dotenv");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for message watcher"))
  .catch((err) => console.error("MongoDB connection error in watcher:", err));

let lastProcessedTime = new Date();

async function checkForNewMessages() {
  try {
    const now = new Date();
    const newMessages = await Message.find({
      status: "received",
      createdAt: { $gte: lastProcessedTime, $lt: now }
    }).sort({ createdAt: 1 }); // Process in order

    if (newMessages.length === 0) {
      console.log("No new messages to process");
      lastProcessedTime = now; // Update even if no messages to avoid rechecking old ones
      return;
    }

    for (const message of newMessages) {
      console.log(`Processing new message: ${message.messageSid}`);

      try {
        // Send a response message
        await sendResponseMessage(message);

        // Only update status if send was successful
        message.status = "processed";
        await message.save();
        
        console.log(`Message processed: ${message._id}`);
      } catch (error) {
        console.error(`Failed to process message ${message._id}:`, error);
        // Consider adding retry logic or moving to failed status
      }
    }

    lastProcessedTime = now;
  } catch (error) {
    console.error("Error checking for new messages:", error);
  }
}

async function sendResponseMessage(message) {
  const responseBody = `We received your message: "${message.body}"`;

  const response = await axios.post(
    "https://3cc4-202-126-89-122.ngrok-free.app/api/messages/send",
    {
      to: message.from, // Send back to the original sender
      body: responseBody,
    }
  );

  console.log("Response sent successfully:", response.data);
}

console.log("Starting message watcher...");

// Initial delay to let the server stabilize
setTimeout(() => {
  checkForNewMessages();
  setInterval(checkForNewMessages, 15000);
}, 5000);

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down message watcher...");
  await mongoose.connection.close();
  process.exit(0);
});
const axios = require("axios");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const dotenv = require("dotenv");

dotenv.config();

// Initialize MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for message watcher"))
  .catch((err) => console.error("MongoDB connection error in watcher:", err));

let lastProcessedTime = new Date();

async function checkForNewMessages() {
  try {
    const now = new Date();
    console.log(`Checking for new messages between ${lastProcessedTime} and ${now}`);

    const newMessages = await Message.find({
      status: "received",
      createdAt: { $gte: lastProcessedTime, $lt: now }
    }).sort({ createdAt: 1 }); // Process in chronological order

    if (newMessages.length === 0) {
      console.log("No new messages to process");
      lastProcessedTime = now; // Update even if no messages to avoid rechecking old ones
      return;
    }

    console.log(`Found ${newMessages.length} new messages to process`);

    for (const message of newMessages) {
      console.log(`Processing message ID: ${message._id} to ${message.from}`);

      try {
        // Send a response message
        await sendResponseMessage(message);

        // Only update status if send was successful
        message.status = "processed";
        await message.save();
        
        console.log(`Successfully processed message ${message._id}`);
      } catch (error) {
        console.error(`Failed to process message ${message._id}:`, error.message);
        // Update status to failed and store the error
        message.status = "failed";
        message.error = error.message;
        await message.save();
      }
    }

    lastProcessedTime = now;
  } catch (error) {
    console.error("Error in checkForNewMessages:", error.message);
  }
}

async function sendResponseMessage(message) {
  const responseBody = `We received your message: "${message.body}"`;

  try {
    const response = await axios.post(
      "https://db43-202-21-114-93.ngrok-free.app/api/message/send",
      {
        to: message.from, 
        body: responseBody,
      },
      {
        headers: {
          "Content-Type": "application/json",
          // Add any required authentication headers here
        },
        timeout: 10000 // 10-second timeout
      }
    );

    if (response.status !== 200) {
      throw new Error(`API responded with status ${response.status}`);
    }

    console.log("Response sent successfully to", message.from);
    return response.data;
  } catch (error) {
    console.error("Failed to send response message to", message.from, error.message);
    throw error; // Re-throw to be caught by the calling function
  }
}

console.log("Starting message watcher...");

// Initial delay to let the server stabilize
setTimeout(() => {
  checkForNewMessages().catch(console.error);
  setInterval(checkForNewMessages, 15000);
}, 5000);

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down message watcher...");
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});
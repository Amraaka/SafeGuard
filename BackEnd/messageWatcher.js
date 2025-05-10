const axios = require("axios");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const dotenv = require("dotenv");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for message watcher"))
  .catch((err) => console.error("MongoDB connection error in watcher:", err));

let lastProcessedMessageId = null;

async function checkForNewMessages() {
  try {
    const fifteenSecondsAgo = new Date(Date.now() - 15000);

    const newMessages = await Message.find({
      status: "received",
      createdAt: { $gte: fifteenSecondsAgo },
    });

    if (newMessages.length === 0) {
      console.log("No new messages to process");
      return;
    }

    for (const message of newMessages) {
      console.log(`Processing new message: ${message.messageSid}`);

      // Send a response message
      await sendResponseMessage(message);

      // Update the message status to 'processed'
      message.status = "processed";
      await message.save();

      console.log(`Message processed: ${message._id}`);
    }
  } catch (error) {
    console.error("Error checking for new messages:", error);
  }
}

async function sendResponseMessage(message) {
  try {
    const to = "+97685114648";
    const responseBody = `We received your message: "${message.body}"`;

    const response = await axios.post(
      "https://0723-202-55-188-85.ngrok-free.app/api/messages/send",
      {
        to: to, // Send back to the original sender
        body: responseBody,
      }
    );

    console.log("Response sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending response message:", error);
  }
}

console.log("Starting message watcher...");

checkForNewMessages();

setInterval(checkForNewMessages, 15000);

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down message watcher...");
  await mongoose.connection.close();
  process.exit(0);
});

const mongoose = require('mongoose');

// MongoDB URI from .env
const MONGO_URI = 'mongodb+srv://amaraabokhbat:g8XMwczht4wcgi7k@safeguarddb.jfi4o6x.mongodb.net/';

// Define the Message schema
const messageSchema = new mongoose.Schema({
    content: String,
    sender: String,
    createdAt: { type: Date, default: Date.now },
});

// Create the Message model
const Message = mongoose.model('Message', messageSchema);

// Connect to MongoDB and fetch messages
async function fetchMessages() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        const messages = await Message.find();
        console.log('Fetched Messages:', messages);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error fetching messages:', error);
        mongoose.connection.close();
    }
}

fetchMessages();

// Simple test script to test your API endpoint
const axios = require('axios');

const testSendMessage = async () => {
  try {
    const response = await axios.post('https://fa74-202-55-188-85.ngrok-free.app/api/messages/send', {
      body: "This is a test message from your Express application"
    });
    
    console.log('API Response:', response.data);
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Error sending message via API:', error.response?.data || error.message);
  }
};

// Alternative test for the simple endpoint
const testSimpleSend = async () => {
  try {
    const response = await axios.post('https://fa74-202-55-188-85.ngrok-free.app/api/messages/send-simple', {
      body: "This is a test message from the simple endpoint"
    });
    
    console.log('API Response:', response.data);
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Error sending message via simple API:', error.response?.data || error.message);
  }
};

// Choose which test to run
testSendMessage().then(() => {
  console.log('Test complete.');
});

// Or run the simple test
// testSimpleSend().then(() => {
//   console.log('Simple test complete.');
// });
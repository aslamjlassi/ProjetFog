const express = require('express');
const app = express();
const port = 3002;
const axios = require('axios');

const serverBURL = 'http://192.168.1.153:3003'; // Replace with the IP address of Server A
const serverAURL = 'http://192.168.1.175:3001'; // Replace with the IP address of Server B

app.use(express.json({ limit: '10mb' }));

app.post('/process-image', async (req, res) => {
  try {
    const image = req.body.imageData;

    

    const selectedServerURL = chooseServerURL(); // Implement your server selection logic

    const result = await axios.post(selectedServerURL, { imageData: image });

    res.send( result.data );
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Image processing failed');
  }
});

app.listen(port, () => {
  console.log(`Main server is running on port ${port}`);
});

let currentServerIndex = 0;

function chooseServerURL() {
  const servers = [serverAURL, serverBURL]; // Array of server URLs

  // Choose the current server based on the currentServerIndex
  const selectedServerURL = servers[currentServerIndex];

  // Update the currentServerIndex for the next request
  currentServerIndex = (currentServerIndex + 1) % servers.length;

  return selectedServerURL+'/process-image';
}
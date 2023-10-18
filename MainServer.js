const express = require("express");
const app = express();
const port = 3002;
const https = require("https");
const axios = require("axios");
const serverBURL = "https://<ip_ address >:3003"; // Replace with the IP address of Server A
const serverAURL = "https:// <ip_ address >:3001"; // Replace with the IP address of Server B
app.use(express.json({ limit: "10mb" }));
const sslOptions = {
  cert: fs.readFileSync("path/cert.pem"),
  key: fs.readFileSync("path/key.pem"),
}; // Créez un serveur HTTPS avec Express
const httpsServer = https.createServer(sslOptions, app);
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});
app.post("/process-image", async (req, res) => {
  try {
    const image = req.body.imageData;
    const selectedServerURL = chooseServerURL(); // Implement your server selection logic
    const result = await axiosInstance.post(selectedServerURL, {
      imageData: image,
    });
    res.send(result.data);
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).send("Image processing failed");
  }
});
httpsServer.listen(port, () => {
  console.log(`Main server is running on port ${port}`);
});

let currentServerIndex = 0;

function chooseServerURL() {
  const servers = [serverAURL, serverBURL]; // Array of server URLs

  // Choose the current server based on the currentServerIndex
  const selectedServerURL = servers[currentServerIndex];

  // Update the currentServerIndex for the next request
  currentServerIndex = (currentServerIndex + 1) % servers.length;

  return selectedServerURL + "/process-image";
}

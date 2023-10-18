const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const https = require("https");
const path = require("path");
const { spawn } = require("child_process");
app.use(express.json({ limit: "10mb" }));
const sslOptions = {
  cert: fs.readFileSync("cert.pem"),
  key: fs.readFileSync("key.pem"),
}; // Créez un serveur HTTPS avec Express
const httpsServer = https.createServer(sslOptions, app);
app.post("/process-image", async (req, res) => {
  try {
    if (!req.body.imageData) {
      return res.status(400).send("Image data is required");
    }
    // Save the incoming image (before processing) as a reference
    fs.writeFileSync(
      "input_image.jpg",
      Buffer.from(req.body.imageData, "base64")
    ); // Execute the Python script for image segmentation (GrabCut)
    const pythonScriptPath = path.join(__dirname, "ObjectDetection.py");
    const inputImagePath = path.join(__dirname, "input_image.jpeg");
    const outputImagePath = path.join(__dirname, "output_image.jpeg");
    const pythonProcess = spawn("python", [
      pythonScriptPath,
      inputImagePath,
      outputImagePath,
    ]);
    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python stdout: ${data}`);
    });
    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python stderr: ${data}`);
    });
    pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
      if (code === 0) {
        // Read the segmented image and send it as a response
        const processedImageData = fs.readFileSync(outputImagePath, {
          encoding: "base64",
        });
        res.send({ processedImage: processedImageData });
      } else {
        res.status(500).send("Object Detection failed");
      }
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).send("Image processing failed");
  }
});
httpsServer.listen(port, () => {
  console.log(`Server A is running on port ${port}`);
});

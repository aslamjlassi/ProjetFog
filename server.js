const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
const fs = require('fs');
const path = require('path');

app.use(express.json({ limit: '10mb' }));

const serverAURL = 'http://<serverA-ip>:3000'; // Replace with the IP address of Server A
const serverBURL = 'http://<serverB-ip>:3001'; // Replace with the IP address of Server B

app.post('/process-image', async (req, res) => {
  try {
    if (!req.body.imageData) {
      return res.status(400).send('Image data is required');
    }

    const imageBuffer = Buffer.from(req.body.imageData, 'base64');

    // Divide the image into two equal parts
    const imagePart1 = imageBuffer.slice(0, imageBuffer.length / 2);
    const imagePart2 = imageBuffer.slice(imageBuffer.length / 2);

    // Dispatch one part to Server A and the other to Server B
    const requests = [
      axios.post(`${serverAURL}/process-image`, { imageData: imagePart1.toString('base64') }),
      axios.post(`${serverBURL}/process-image`, { imageData: imagePart2.toString('base64') }),
    ];

    // Wait for both servers to complete their tasks
    const [responseA, responseB] = await Promise.all(requests);

    // Combine the processed results from Server A and Server B
    const combinedImage = combineImages(responseA.data.processedImage, responseB.data.processedImage);

    // Send the combined result to the client
    res.send({ processedImage: combinedImage });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Image processing failed');
  }
});

async function combineImages(imageData1, imageData2) {
  // Convert the base64 image data to Buffer objects
  const buffer1 = Buffer.from(imageData1, 'base64');
  const buffer2 = Buffer.from(imageData2, 'base64');

  // Load the images using Jimp
  try {
    const [image1, image2] = await Promise.all([Jimp.read(buffer1), Jimp.read(buffer2)]);
    // Ensure both images have the same dimensions (resize if necessary)
    if (image1.getWidth() !== image2.getWidth() || image1.getHeight() !== image2.getHeight()) {
      const maxWidth = Math.max(image1.getWidth(), image2.getWidth());
      const maxHeight = Math.max(image1.getHeight(), image2.getHeight());
      image1.resize(maxWidth, maxHeight);
      image2.resize(maxWidth, maxHeight);
    }

    // Overlay the second image (image2) with some transparency
    image1.composite(image2, 0, 0, {
      mode: Jimp.BLEND_OVERLAY,
      opacityDest: 0.7, // Adjust the opacity as needed
      opacitySource: 0.7,
    });
    const combinedBuffer = image1.getBufferAsync(Jimp.MIME_JPEG);
    return combinedBuffer.toString('base64');
  } catch (error) {
    console.error('Error combining images:', error);
    return null;
  }
}


app.listen(port, () => {
  console.log(`Main Server is running on port ${port}`);
});

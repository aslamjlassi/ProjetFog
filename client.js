const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const path = require('path');


const mainServerURL = 'http://192.168.1.180:3002'; // Replace with the IP address of the main server

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function processImage(imageFile) {
  const imageBuffer = fs.readFileSync(imageFile);
  const imageBase64 = imageBuffer.toString('base64');

  const imageData = {
    imageData: imageBase64,
  };

  return axios.post(`${mainServerURL}/process-image`, imageData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

rl.question('Enter the paths to the image files (comma-separated): ', (imageFiles) => {
  const imageFileArray = imageFiles.split(',').map((file) => file.trim());

  const processImagePromises = imageFileArray.map((imageFile) => {
    return processImage(imageFile)
      .then((response) => {
        const result = response.data;
        const processedImageBuffer = Buffer.from(result.processedImage, 'base64');
        console.log(path.dirname(imageFile));
        console.log(path.basename(imageFile));
        const outputFileName = `${path.dirname(imageFile)}/processed_${path.basename(imageFile)}`;
        fs.writeFileSync(outputFileName, processedImageBuffer);

        console.log(`Image processing completed for ${imageFile}. Processed image saved as ${outputFileName}`);
      })
      .catch((error) => {
        console.error(`Error processing image ${imageFile}:`, error);
      });
  });

  Promise.all(processImagePromises)
    .then(() => {
      rl.close();
    });
});

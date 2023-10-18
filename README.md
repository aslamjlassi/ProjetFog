# Fog Computing Project README

This project demonstrates a fog computing setup for distributed image processing using Node.js for the server and Python for image processing. The project involves multiple servers (Server A and Server B and main Server) and a client for uploading and processing images.

## Getting Started

Before using this project, ensure that you have the necessary dependencies installed.

### HTTPS Server Dependencies

To create certificates for the HTTPS connection, you need to install OpenSSL.

### Node.js Server Dependencies

To run the Node.js servers, you need to install the following dependencies:

- Express: `npm install express`
- Axios: `npm install axios`

### Python Server Dependencies

To run the Python image processing server, you need to have the following libraries installed:

- TensorFlow: `pip install tensorflow`
- OpenCV: `pip install opencv-python`
- NumPy: `pip install numpy`

### Usage

1. Clone this repository.

2. Create SSL certificates using the command `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365` 

3. Update the IP addresses of the servers in the client code.

4. Ensure that the image you want to upload is in JPEG format.

5. Run the Node.js servers (`serverA.js` and `serverB.js`).

6. Run the main server(`server.js`) .

7. Run `client.js`

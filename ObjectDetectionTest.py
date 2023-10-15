import cv2
import numpy as np
import tensorflow as tf
import numpy as np
from PIL import Image
import sys

# Load your pre-trained object detection model in .pb format
model = tf.saved_model.load('./')

def detect_objects(input_image_path, output_image_path):
    # Load the input image
    image = cv2.imread(input_image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert to RGB color space
    image = cv2.resize(image, (300, 300))  # Resize the image to the expected size (you can adjust this size)

    # Normalize the image (optional, depends on the model)
    image = image / 255.0  # Assuming the model expects values in the range [0, 1]

    # Cast the image to uint8
    image = (image * 255).astype(np.uint8)

    # Expand dimensions to match the model's expected input shape
    input_tensor = tf.convert_to_tensor(image)
    input_tensor = tf.expand_dims(input_tensor, axis=0)  # Add batch dimension

    # Run inference on the model
    detections = model(input_tensor)

    # Draw rectangles around detected objects
    image_with_rectangles = image.copy()
    for detection in detections['detection_boxes'][0]:
        ymin, xmin, ymax, xmax = detection.numpy()
        ymin, xmin, ymax, xmax = int(ymin * image.shape[0]), int(xmin * image.shape[1]), int(ymax * image.shape[0]), int(xmax * image.shape[1])
        cv2.rectangle(image_with_rectangles, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)

    # Save the image with rectangles to the output file
    cv2.imwrite(output_image_path, image_with_rectangles)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python object_detection_test.py input_image_path output_image_path")
        sys.exit(1)

    input_image_path = sys.argv[1]
    output_image_path = sys.argv[2]

    # Perform object detection and save the result image
    detect_objects(input_image_path, output_image_path)

import tkinter as tk
from tkinter import ttk
from tkinter import filedialog
from PIL import Image, ImageTk
import requests
from io import BytesIO
import threading

# Define the server URL
server_url = 'http://<main-server-ip>:3000'  # Replace with the actual main server IP

# Function to upload and process the image
def upload_and_process():
    file_path = filedialog.askopenfilename(filetypes=[("Image Files", "*.jpg *.jpeg *.png")])
    if file_path:
        progress_bar["value"] = 0  # Reset the progress bar
        progress_bar.update()

        def upload_image():
            image = Image.open(file_path)
            image = image.resize((800, 600))  # Resize the image for display

            # Display the uploaded image
            photo = ImageTk.PhotoImage(image)
            image_label.config(image=photo)
            image_label.image = photo
            image_label.update()

            # Send the image to the server for processing
            files = {'image': open(file_path, 'rb')}
            response = requests.post(f"{server_url}/process-image", files=files, stream=True)

            # Receive and display the processed image
            if response.status_code == 200:
                image_data = BytesIO(response.content)
                processed_image = Image.open(image_data)
                processed_image = processed_image.resize((800, 600))  # Resize the processed image

                photo = ImageTk.PhotoImage(processed_image)
                image_label.config(image=photo)
                image_label.image = photo
                image_label.update()
            else:
                print("Image processing failed")

            progress_bar["value"] = 100  # Set the progress bar to 100% when done
            progress_bar.update()

        # Start the upload and processing in a separate thread
        threading.Thread(target=upload_image).start()

# Create the main window
window = tk.Tk()
window.title("Image Processing Client")

# Set the window size and background color
window.geometry("1000x800")
window.configure(bg="#f2f2f2")

# Create and configure the widgets
style = ttk.Style()
style.configure("TButton", padding=10, relief="flat", font=("Helvetica", 12), background="#0077b6", foreground="white")
style.configure("TButton.TButton", foreground="blue")  # Set text color for the button
style.configure("TLabel", font=("Helvetica", 14), background="#f2f2f2")

upload_button = ttk.Button(window, text="Upload Image(JPEG)", command=upload_and_process, style="TButton.TButton")  # Apply the style
image_label = ttk.Label(window, background="white", borderwidth=2, relief="solid", text="Uploaded Image")
progress_bar = ttk.Progressbar(window, length=400, mode="determinate")

# Arrange the widgets in the window
upload_button.pack(pady=20)
image_label.pack(pady=20)
progress_bar.pack(pady=20)

# Start the GUI application
window.mainloop()

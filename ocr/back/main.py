
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import io

from detect_tes import PlateDetector

app = FastAPI()

# Allow cross-origin requests (useful when frontend and backend are on different domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow all origins (adjust in production)
    allow_credentials=True,
    allow_methods=["*"],        # Allow all HTTP methods
    allow_headers=["*"],        # Allow all request headers
)

# Initialize plate detector model once at startup (prevents reloading model every request)
detector = PlateDetector(
    model_path="models/license_plate_detector.pt",
    conf_thresh=0.5
)

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
     """Receive an uploaded image, run plate detection, and return results."""

    # Read uploaded file as raw binary
    contents = await file.read()
    # Convert binary data into a NumPy array for OpenCV processing
    np_arr = np.frombuffer(contents, np.uint8)
    # Decode NumPy array into an image (BGR format)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Run plate detection & OCR
    # detect_and_read_img returns (processed_image, detections)
    _, detections = detector.detect_and_read_img(img)

    # Return detection results as JSON
    return {"detections": detections}


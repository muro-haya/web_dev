"""
import cv2
# from detect import PlateDetector
from detect_tes import PlateDetector

if __name__ == "__main__":
    detector = PlateDetector(
        model_path="models/license_plate_detector.pt",
        conf_thresh=0.5,
        # ocr_langs=['en']
    )

    img_path = "images/IMG_008.jpg"
    img, plates = detector.detect_and_read_path(img_path)

    # Drow a result
    for det in plates:
        x1, y1, x2, y2 = det["box"]
        text = det["text"]
        cv2.rectangle(img, (x1,y1), (x2,y2), (0,255,0), 2)
        cv2.putText(img, text, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        print(f"Detected Plate: {text}")

    cv2.imwrite("results/IMG_008.jpg", img)
    print(f"{len(plates)} plate(s) detected. Saved to output.jpg")
"""

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import io

from detect_tes import PlateDetector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = PlateDetector(
    model_path="models/license_plate_detector.pt",
    conf_thresh=0.5
)

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Read binali
    contents = await file.read()
    # Exchange numpy list
    np_arr = np.frombuffer(contents, np.uint8)
    # Decode to OpenCV
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Carry out detection
    _, detections = detector.detect_and_read_img(img)

    return {"detections": detections}


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
    img, plates = detector.detect_and_read(img_path)

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


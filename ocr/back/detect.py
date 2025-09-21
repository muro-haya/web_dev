from ultralytics import YOLO
import cv2
import easyocr

class PlateDetector:
    def __init__(self, model_path, conf_thresh, ocr_langs):
        """
        Initialize
        """
        self.model = YOLO(model_path)
        self.conf_thresh = conf_thresh
        self.reader = easyocr.Reader(ocr_langs, gpu=False)

    def detect_plates(self, img_path: str):
        """
        Detect a number plate by AI
        """
        img = cv2.imread(img_path)
        results = self.model(img, conf=self.conf_thresh)
        detections = []

        for r in results:
            for box in r.boxes.xyxy:  # (x1, y1, x2, y2)
                x1, y1, x2, y2 = map(int, box.tolist())
                plate_img = img[y1:y2, x1:x2]
        
                # cut the outer shell
                h, w = plate_img.shape[:2]
                margin_h = int(h * 0.10)  # top and bottom 15%
                margin_w = int(w * 0.05)  # left and right 10%
                inner_img = plate_img[
                    margin_h : max(h - margin_h, margin_h + 1),
                    margin_w : max(w - margin_w, margin_w + 1)
                ]

                detections.append({
                    "box": (x1, y1, x2, y2), 
                    "image": inner_img
                })
        return img, detections

    def read_text(self, plate_img):
        """
        Read charactors by OCR
        """
        # Pretreatment
        gray_img = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)

        gray_img = cv2.resize(gray_img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        
        kernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (25, 25))
        blur_img = cv2.dilate(gray_img, kernel)
        blur_img = cv2.erode(blur_img, kernel)

        kernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (11, 11))
        blur_img = cv2.erode(blur_img, kernel)
        # blur_img = cv2.GaussianBlur(gray_img, (65,65), 0)
        
        _, thresh_img = cv2.threshold(blur_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        scaled_img = cv2.resize(thresh_img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        
        cv2.imwrite("results/gray_img2.jpg", gray_img)
        cv2.imwrite("results/thresh_img2.jpg", thresh_img)
        cv2.imwrite("results/thresh_img2.jpg", scaled_img)

        result = self.reader.readtext(scaled_img, detail=0)
        # The result is list. It might have some answers.
        return " ".join(result).strip()

    def detect_and_read(self, img_path: str):
        """
        Carry out detecting and reading
        """
        img, detections = self.detect_plates(img_path)
        for det in detections:
            det["text"] = self.read_text(det["image"])

        return img, detections

from ultralytics import YOLO
import cv2
import pytesseract

class PlateDetector:
    def __init__(self, model_path, conf_thresh):
        """
        Initialize
        """
        self.model = YOLO(model_path)
        self.conf_thresh = conf_thresh
        # Tesseractのオプション（単一行モード + 英数字のみ）
        self.tess_config = (
            "--psm 7 --oem 3 "
            "-c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        )
        
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

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

                # 外周カット（上10%, 下10%, 左右5%）
                h, w = plate_img.shape[:2]
                margin_h = int(h * 0.10)
                margin_w = int(w * 0.05)
                inner_img = plate_img[
                    margin_h : max(h - margin_h, margin_h + 1),
                    margin_w : max(w - margin_w, margin_w + 1)
                ]

                detections.append({
                    "box": (x1, y1, x2, y2),
                    # "image": inner_img
                    "image": plate_img
                })
        return img, detections

    def read_text(self, plate_img):
        """
        Read characters using Tesseract OCR
        """
        
        # Resize the image
        # Get original dimensions
        h, w = plate_img.shape[:2]
        # Desired new height
        new_height = 100
        # Compute new width to maintain aspect ratio
        new_width = int((new_height / h) * w)
        resized_img = cv2.resize(plate_img, (new_width, new_height), interpolation=cv2.INTER_AREA)

        # グレースケール変換
        gray_img = cv2.cvtColor(resized_img, cv2.COLOR_BGR2GRAY)

        # リサイズ（高解像度化）
        gray_img = cv2.resize(gray_img, None, fx=2, fy=2,
                              interpolation=cv2.INTER_CUBIC)

        # ノイズ除去（モルフォロジー処理）
        kernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
        blur_img = cv2.dilate(gray_img, kernel)
        blur_img = cv2.erode(blur_img, kernel)
        # kernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (11, 11))
        # blur_img = cv2.erode(blur_img, kernel)

        # 2値化
        _, thresh_img = cv2.threshold(
            blur_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )
        
        cv2.imwrite("results/gray_IMG_008.jpg", gray_img)
        cv2.imwrite("results/thresh_IMG_008.jpg", thresh_img)
        # cv2.imwrite("results/thresh_img2.jpg", scaled_img)

        # OCR実行
        result = pytesseract.image_to_string(
            thresh_img,
            lang="eng",
            config=self.tess_config
        )
        return result.strip()

    def detect_and_read(self, img_path: str):
        """
        Carry out detecting and reading
        """
        img, detections = self.detect_plates(img_path)
        for det in detections:
            det["text"] = self.read_text(det["image"])
        return img, detections

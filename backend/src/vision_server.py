from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import uvicorn
import sys

app = FastAPI(title="YOLOv8 EOC Vision Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the YOLOv8 Nano model (pretrained on COCO dataset)
try:
    model = YOLO("yolov8n.pt")
    print("YOLOv8 model loaded successfully.")
except Exception as e:
    print(f"Failed to load YOLOv8 model: {e}")
    sys.exit(1)

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {
                "victims": [],
                "message": "Failed to decode uploaded image.",
                "model": "YOLOv8n (Live Inference)"
            }

        img_h, img_w, _ = img.shape

        # Run inference (conf=0.25 threshold)
        results = model(img, conf=0.25)
        
        victims = []
        for box in results[0].boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())

            # Filter only: 0 = person, 8 = boat
            if cls_id in [0, 8]:
                label = "person" if cls_id == 0 else "boat"
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                victims.append({
                    "x": float(x1),
                    "y": float(y1),
                    "w": float(x2 - x1),
                    "h": float(y2 - y1),
                    "label": "Victim (Stranded)" if label == "person" else "Rescue Boat",
                    "conf": f"{conf * 100:.1f}%"
                })

        if not victims:
            return {
                "victims": [],
                "message": "No victims detected",
                "model": "YOLOv8n (Live Inference)",
                "width": img_w,
                "height": img_h
            }

        return {
            "victims": victims,
            "model": "YOLOv8n (Live Inference)",
            "width": img_w,
            "height": img_h
        }

    except Exception as e:
        print(f"Error during inference: {e}")
        return {
            "victims": [],
            "message": f"Inference engine failure: {str(e)}",
            "model": "YOLOv8n (Live Inference)"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

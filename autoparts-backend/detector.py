# detector.py - Gemini API Version
import sys
import json
import os
import cv2
import base64
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# --- CẤU HÌNH API KEY ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

VIS_TEMP_PATH = Path(os.path.abspath(os.path.dirname(__file__))) / "vis_temp.png"

def run_detection(image_path):
    try:
        # 1. Đọc ảnh
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Không tìm thấy ảnh: {image_path}")

        model = genai.GenerativeModel('gemini-2.5-flash')
        
        with open(image_path, "rb") as f:
            image_data = f.read()
            
        # Load image with OpenCV for drawing
        image = cv2.imread(image_path)
        if image is None:
             raise ValueError("Could not read image with OpenCV")
        height, width, _ = image.shape

        prompt = """
        Analyze this image of a vehicle.
        1. Identify the vehicle brand (Make).
        2. Identify the vehicle model (Name).
        3. Identify any visible damages and the specific parts affected.
        
        IMPORTANT: For the 'label' of the part, try to use one of the following standard keys if applicable:
        ['headlight', 'mirror', 'windshield', 'fog_light', 'mudguard', 'bumper', 'door', 'hood', 'trunk', 'wheel', 'grille', 'fender', 'engine_compartment', 
         'Quarter-panel', 'Front-wheel', 'Back-window', 'Front-door', 'Rocker-panel', 'Front-window', 'Back-door', 'Back-wheel', 'Back-windshield', 
         'Tail-light', 'License-plate', 'Front-bumper', 'Back-bumper', 'Roof']
        If the part is not in this list, use a descriptive name in English.

        IMPORTANT: For 'damage_type', try to use one of these standard types:
        ['Dent', 'Scratch', 'Broken part', 'Paint chip', 'Missing part', 'Flaking', 'Corrosion', 'Cracked']
        
        For each detected part/damage, provide the bounding box in [ymin, xmin, ymax, xmax] format, where coordinates are normalized to 0-1000.
        
        Return the result in valid JSON format with this structure:
        {
            "brand": "Brand Name",
            "model": "Model Name",
            "parts": [
                {
                    "label": "Part Name (Standard Key if possible)",
                    "damage_type": "Damage Type (Standard if possible)",
                    "box_2d": [ymin, xmin, ymax, xmax],
                    "conf": 0.9
                }
            ]
        }
        If no damage is found, return an empty list for parts.
        Do not use markdown formatting (like ```json), just return the raw JSON string.
        """

        response = model.generate_content([
            {'mime_type': 'image/jpeg', 'data': image_data},
            prompt
        ])

        # Parse JSON response
        text_response = response.text.strip()
        # Clean up if Gemini adds markdown code blocks
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
        
        result_json = json.loads(text_response.strip())
        
        # Draw bounding boxes
        vis_img = image.copy()
        parts = result_json.get("parts", [])
        
        # Draw bounding boxes
        vis_img = image.copy()
        parts = result_json.get("parts", [])
        
        for part in parts:
            box = part.get("box_2d")
            if box and len(box) == 4:
                ymin, xmin, ymax, xmax = box
                # Convert normalized coordinates to pixel coordinates
                x1 = int(xmin / 1000 * width)
                y1 = int(ymin / 1000 * height)
                x2 = int(xmax / 1000 * width)
                y2 = int(ymax / 1000 * height)
                
                # Draw rectangle (Red color)
                cv2.rectangle(vis_img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                
                # Draw label
                label_text = f"{part.get('damage_type', '')} - {part.get('label', '')}"
                (w, h), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(vis_img, (x1, y1 - 20), (x1 + w, y1), (0, 0, 255), -1)
                cv2.putText(vis_img, label_text, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        # Encode image to base64
        if cv2.imwrite(str(VIS_TEMP_PATH), vis_img):
            with open(VIS_TEMP_PATH, "rb") as img_file:
                b64_string = base64.b64encode(img_file.read()).decode('utf-8')
            os.remove(VIS_TEMP_PATH)
        else:
            b64_string = None

        output_json = {
            "num_detections": len(parts),
            "visual_output_base64": b64_string,
            "brand": result_json.get("brand", "Unknown"),
            "model": result_json.get("model", "Unknown"),
            "parts": parts,
            "raw_details": result_json
        }

        print(json.dumps(output_json))
        sys.stdout.flush()

    except Exception as e:
        import traceback
        err_msg = {
            "error": str(e),
            "details": traceback.format_exc(),
            "visual_output_base64": None
        }
        print(json.dumps(err_msg))
        sys.stdout.flush()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_detection(sys.argv[1])
    else:
        print(json.dumps({"error": "No image path"}))

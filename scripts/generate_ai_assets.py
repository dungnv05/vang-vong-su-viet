#!/usr/bin/env python3
"""
Script hỗ trợ gọi Nano Banana API (hoặc Replicate / Flux / Stable Diffusion) 
để tự động sinh ảnh PNG/JPG nghệ thuật cho Võ Tướng & Quái Vật từ Prompt.

Cách dùng:
1. Đặt API KEY vào biến môi trường NANO_BANANA_API_KEY hoặc BANANA_API_KEY
2. Chạy: python3 scripts/generate_ai_assets.py
"""

import os
import sys
import json
import urllib.request

# Cấu hình API Key Nano Banana (Banana.dev / Serverless GPU)
API_KEY = os.environ.get("NANO_BANANA_API_KEY") or os.environ.get("BANANA_API_KEY") or ""
MODEL_URL = os.environ.get("NANO_BANANA_MODEL_URL") or "https://api.banana.dev/v1/run"

# Danh sách Prompt sinh ảnh cho Game Sử Việt
CHARACTER_PROMPTS = [
    {
        "filename": "src/assets/heroes/avatars/thanh_giong.png",
        "prompt": "Epic anime portrait of Saint Giong (Thanh Giong), legendary Vietnamese hero warrior in golden glowing armor riding a fiery iron horse, holding a bamboo spear, dark fantasy background, HD detailed 8k"
    },
    {
        "filename": "src/assets/heroes/avatars/le_loi.png",
        "prompt": "Emperor Le Loi of Vietnam holding the glowing golden divine sword Thuan Thien, wearing royal dragon armor, heroic Vietnamese king portrait, digital anime art, 8k"
    },
    {
        "filename": "src/assets/heroes/avatars/nguyen_trai.png",
        "prompt": "Nguyen Trai ancient Vietnamese scholar strategist, wearing blue traditional royal robes holding a calligraphy scroll and sword, dignified portrait, digital anime art, 8k"
    },
    {
        "filename": "src/assets/monsters/avatars/to_dinh.png",
        "prompt": "Evil Han dynasty warlord boss To Dinh, dark aggressive armor, menacing warlord face portrait, fantasy digital art"
    },
    {
        "filename": "src/assets/monsters/avatars/o_ma_nhi.png",
        "prompt": "Mongol general enemy boss Omar, fierce barbarian warlord with fur helmet and spiked armor, dark digital art portrait"
    }
]

def generate_image_from_prompt(prompt, output_filename):
    print(f"🎨 Đang gửi Prompt tới Nano Banana: '{prompt[:60]}...'")
    
    if not API_KEY:
        print("⚠️ Chưa tìm thấy NANO_BANANA_API_KEY. Vui lòng thiết lập: export NANO_BANANA_API_KEY='your_api_key'")
        return False

    payload = {
        "apiKey": API_KEY,
        "modelInputs": {
            "prompt": prompt,
            "negative_prompt": "blurry, low quality, distorted, extra limbs, bad anatomy",
            "width": 512,
            "height": 512,
            "num_inference_steps": 30
        }
    }

    try:
        req = urllib.request.Request(
            MODEL_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            image_base64 = res_data.get("modelOutputs", [{}])[0].get("image_base64")
            
            if image_base64:
                import base64
                with open(output_filename, "wb") as f:
                    f.write(base64.b64decode(image_base64))
                print(f"✅ Đã tạo file ảnh thành công: {output_filename}")
                return True
    except Exception as e:
        print(f"❌ Lỗi khi kết nối Nano Banana API: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Bắt đầu quá trình sinh ảnh AI từ Nano Banana cho Game Sử Việt...")
    for item in CHARACTER_PROMPTS:
        generate_image_from_prompt(item["prompt"], item["filename"])

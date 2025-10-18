import requests
import os

# API Key của bạn
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

# Endpoint ListModels để lấy danh sách mô hình
LIST_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models:listModels"

def list_models():
    # Gửi yêu cầu GET tới ListModels endpoint
    response = requests.get(
        LIST_MODELS_URL,
        headers={"Content-Type": "application/json"},
        params={"key": GEMINI_API_KEY}
    )
    
    if response.status_code == 200:
        models = response.json()
        print("Danh sách các mô hình có sẵn:")
        print(models)  # In ra danh sách mô hình
        return models
    else:
        print(f"Error: {response.text}")
        return None

# Gọi hàm để kiểm tra các mô hình
models = list_models()

# Lọc hoặc xử lý các mô hình nếu cần
if models:
    # Bạn có thể lọc mô hình bạn muốn sử dụng
    available_models = models.get('models', [])
    print(f"Models Available: {available_models}")

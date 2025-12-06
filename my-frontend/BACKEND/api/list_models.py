import requests
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

LIST_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models:listModels"

def list_models():
    response = requests.get(
        LIST_MODELS_URL,
        headers={"Content-Type": "application/json"},
        params={"key": GEMINI_API_KEY}
    )
    
    if response.status_code == 200:
        models = response.json()
        print("Danh sách các mô hình có sẵn:")
        print(models)
        return models
    else:
        print(f"Error: {response.text}")
        return None

models = list_models()

if models:
    available_models = models.get('models', [])
    print(f"Models Available: {available_models}")

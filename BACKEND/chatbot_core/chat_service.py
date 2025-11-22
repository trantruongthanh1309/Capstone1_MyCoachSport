import random
import json
import torch
import os

# Import từ cùng thư mục
from .model import NeuralNet
from .nltk_utils import bag_of_words, tokenize

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Đường dẫn file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTENTS_FILE = os.path.join(BASE_DIR, 'intents.json')
DATA_FILE = os.path.join(BASE_DIR, 'data.pth')

# Load dữ liệu model đã train
with open(INTENTS_FILE, 'r', encoding='utf-8') as f:
    intents = json.load(f)

if os.path.exists(DATA_FILE):
    data = torch.load(DATA_FILE)

    input_size = data["input_size"]
    hidden_size = data["hidden_size"]
    output_size = data["output_size"]
    all_words = data["all_words"]
    tags = data["tags"]
    model_state = data["model_state"]

    model = NeuralNet(input_size, hidden_size, output_size).to(device)
    model.load_state_dict(model_state)
    model.eval()
else:
    print("⚠️ Chưa tìm thấy file data.pth. Hãy chạy train.py trước!")
    model = None

def get_response(msg):
    if not model:
        return "Hệ thống đang bảo trì (Chưa train model)."

    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    # Tính độ tin cậy (Probability)
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent['tag']:
                return random.choice(intent['responses'])
    
    return "Xin lỗi, tôi chưa hiểu ý bạn. Hãy thử hỏi về bài tập, dinh dưỡng hoặc lịch tập nhé!"

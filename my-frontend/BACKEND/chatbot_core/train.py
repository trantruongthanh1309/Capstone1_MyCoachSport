import json
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from nltk_utils import bag_of_words, tokenize, stem
from model import NeuralNet

import os

# 1. Load dữ liệu
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTENTS_FILE = os.path.join(BASE_DIR, 'intents_mega.json')  # ✅ MEGA DATASET!
FILE = os.path.join(BASE_DIR, 'data.pth')

with open(INTENTS_FILE, 'r', encoding='utf-8') as f:
    intents = json.load(f)

all_words = []
tags = []
xy = []

# 2. Xử lý dữ liệu (Tokenize, Stem)
for intent in intents['intents']:
    tag = intent['tag']
    tags.append(tag)
    for pattern in intent['patterns']:
        w = tokenize(pattern)
        all_words.extend(w)
        xy.append((w, tag))

ignore_words = ['?', '!', '.', ',']
all_words = [stem(w) for w in all_words if w not in ignore_words]
all_words = sorted(set(all_words))
tags = sorted(set(tags))

print(f"🔢 Vocabulary size: {len(all_words)} words")
print(f"🏷️ Number of tags: {len(tags)}")
print(f"📝 Training samples: {len(xy)}")

# 3. Tạo Training Data
X_train = []
y_train = []

for (pattern_sentence, tag) in xy:
    bag = bag_of_words(pattern_sentence, all_words)
    X_train.append(bag)
    label = tags.index(tag)
    y_train.append(label)

X_train = np.array(X_train)
y_train = np.array(y_train)

# 4. Dataset & DataLoader
class ChatDataset(Dataset):
    def __init__(self):
        self.n_samples = len(X_train)
        self.x_data = X_train
        self.y_data = y_train

    def __getitem__(self, index):
        return self.x_data[index], self.y_data[index]

    def __len__(self):
        return self.n_samples

# Hyper-parameters (✅ TỐI ƯU TỐC ĐỘ)
num_epochs = 150  # Đủ để đạt Loss 0.0000
batch_size = 128  # Tăng tốc độ training gấp 4 lần
learning_rate = 0.001
input_size = len(X_train[0])
hidden_size = 512  # Tăng từ 128 lên 512 neurons - SIÊU THÔNG MINH!
output_size = len(tags)

dataset = ChatDataset()
train_loader = DataLoader(dataset=dataset, batch_size=batch_size, shuffle=True, num_workers=0)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = NeuralNet(input_size, hidden_size, output_size).to(device)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

# 5. Training Loop
print("🚀 Đang bắt đầu train model...")
for epoch in range(num_epochs):
    for (words, labels) in train_loader:
        words = words.to(device)
        labels = labels.to(dtype=torch.long).to(device)
        
        # Forward pass
        outputs = model(words)
        loss = criterion(outputs, labels)
        
        # Backward and optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
    if (epoch+1) % 100 == 0:
        print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

print(f'✅ Training hoàn tất. Loss cuối cùng: {loss.item():.4f}')

# 6. Lưu Model
data = {
    "model_state": model.state_dict(),
    "input_size": input_size,
    "hidden_size": hidden_size,
    "output_size": output_size,
    "all_words": all_words,
    "tags": tags
}

# FILE = "data.pth" (Đã define ở trên)
torch.save(data, FILE)

print(f'💾 Đã lưu model vào file {FILE}')

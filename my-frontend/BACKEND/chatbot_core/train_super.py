"""
Train SUPER Model - Thông minh cực kỳ
Hidden size: 3072, Epochs: 400, Batch: 512
"""
import json
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nltk_utils import bag_of_words, tokenize, stem
from model import NeuralNet

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTENTS_FILE = os.path.join(BASE_DIR, 'data', 'intents_mega.json')
FILE = os.path.join(BASE_DIR, 'data.pth')

print("=" * 70)
print("TRAINING SUPER MODEL")
print("Thong minh cuc ky!")
print("=" * 70)

print("\nDang doc training data...")
with open(INTENTS_FILE, 'r', encoding='utf-8') as f:
    intents = json.load(f)

all_words = []
tags = []
xy = []

print("Dang xu ly intents...")
for intent in intents['intents']:
    tag = intent['tag']
    if tag not in tags:
        tags.append(tag)
    patterns = intent.get('patterns', [])
    for pattern in patterns:
        w = tokenize(pattern)
        all_words.extend(w)
        xy.append((w, tag))

ignore_words = ['?', '!', '.', ',']
all_words = [stem(w) for w in all_words if w not in ignore_words]
all_words = sorted(set(all_words))
tags = sorted(set(tags))

print(f"\nTHONG KE:")
print(f"Vocabulary size: {len(all_words):,} words")
print(f"Number of tags: {len(tags)}")
print(f"Training samples: {len(xy):,}")

X_train = []
y_train = []

print("\nDang tao training vectors...")
for (pattern_sentence, tag) in xy:
    bag = bag_of_words(pattern_sentence, all_words)
    X_train.append(bag)
    label = tags.index(tag)
    y_train.append(label)

X_train = np.array(X_train)
y_train = np.array(y_train)

class ChatDataset(Dataset):
    def __init__(self):
        self.n_samples = len(X_train)
        self.x_data = X_train
        self.y_data = y_train

    def __getitem__(self, index):
        return self.x_data[index], self.y_data[index]

    def __len__(self):
        return self.n_samples

# CẤU HÌNH CỰC MẠNH
num_epochs = 400  # Tăng lên 400
batch_size = 512  # Tăng lên 512
learning_rate = 0.0005  # Giảm xuống để ổn định hơn
input_size = len(X_train[0])
hidden_size = 3072  # Tăng lên 3072 - RẤT MẠNH!
output_size = len(tags)

print(f"\nMODEL ARCHITECTURE:")
print(f"   - Input size: {input_size:,}")
print(f"   - Hidden size: {hidden_size:,} neurons (CUC KY MANH!)")
print(f"   - Output size: {output_size}")
print(f"   - Epochs: {num_epochs}")
print(f"   - Batch size: {batch_size}")
print(f"   - Learning rate: {learning_rate}")

dataset = ChatDataset()
train_loader = DataLoader(dataset=dataset, batch_size=batch_size, shuffle=True, num_workers=0)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"\nDevice: {device}")

model = NeuralNet(input_size, hidden_size, output_size).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

print("\n" + "=" * 70)
print("DANG BAT DAU TRAIN MODEL...")
print("Qua trinh nay co the mat 20-40 phut...")
print("=" * 70 + "\n")

best_loss = float('inf')
for epoch in range(num_epochs):
    epoch_loss = 0
    for (words, labels) in train_loader:
        words = words.to(device)
        labels = labels.to(dtype=torch.long).to(device)
        
        outputs = model(words)
        loss = criterion(outputs, labels)
        
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        epoch_loss += loss.item()
    
    avg_loss = epoch_loss / len(train_loader)
    if avg_loss < best_loss:
        best_loss = avg_loss
    
    # Hien thi moi 10 epochs de thay progress
    if (epoch+1) % 10 == 0 or (epoch+1) == 1:
        print(f'Epoch [{epoch+1:3d}/{num_epochs}], Loss: {avg_loss:.6f}, Best: {best_loss:.6f}')
        sys.stdout.flush()  # Force flush de hien thi ngay

print(f'\nTRAINING HOAN TAT!')
print(f'Loss cuoi cung: {avg_loss:.6f}')
print(f'Best loss: {best_loss:.6f}')

data = {
    "model_state": model.state_dict(),
    "input_size": input_size,
    "hidden_size": hidden_size,
    "output_size": output_size,
    "all_words": all_words,
    "tags": tags
}

torch.save(data, FILE)

print(f'\nDa luu model vao file {FILE}')
print(f'\nMODEL DA SAN SANG SU DUNG!')
print(f'\nTHONG KE CUOI CUNG:')
print(f'   - Vocabulary: {len(all_words):,} words')
print(f'   - Intents: {len(tags)} categories')
print(f'   - Training samples: {len(xy):,} patterns')
print(f'   - Model size: {hidden_size:,} neurons (CUC KY MANH!)')
print(f'   - Training epochs: {num_epochs}')
print(f'\nChatbot gio day THONG MINH CUC KY!')














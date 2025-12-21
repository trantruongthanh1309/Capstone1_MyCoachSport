"""
Train chatbot ngay - Hiển thị output rõ ràng
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
print("TRAINING CHATBOT - TANG THONG MINH LEN NHIEU LAN")
print("=" * 70)

print("\n1. Dang doc training data...")
with open(INTENTS_FILE, 'r', encoding='utf-8') as f:
    intents = json.load(f)

all_words = []
tags = []
xy = []

print("2. Dang xu ly intents...")
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

print(f"\n3. THONG KE:")
print(f"   - Vocabulary: {len(all_words):,} words")
print(f"   - Tags: {len(tags)} categories")
print(f"   - Training samples: {len(xy):,} patterns")

X_train = []
y_train = []

print("\n4. Dang tao training vectors...")
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

# CAU HINH CUC MANH
num_epochs = 400
batch_size = 512
learning_rate = 0.0005
input_size = len(X_train[0])
hidden_size = 3072
output_size = len(tags)

print(f"\n5. MODEL ARCHITECTURE:")
print(f"   - Input size: {input_size:,}")
print(f"   - Hidden size: {hidden_size:,} neurons (CUC KY MANH!)")
print(f"   - Output size: {output_size}")
print(f"   - Epochs: {num_epochs}")
print(f"   - Batch size: {batch_size}")

dataset = ChatDataset()
train_loader = DataLoader(dataset=dataset, batch_size=batch_size, shuffle=True, num_workers=0)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"\n6. Device: {device}")

model = NeuralNet(input_size, hidden_size, output_size).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

print("\n" + "=" * 70)
print("BAT DAU TRAINING...")
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
    
    # Hien thi progress moi 10 epochs
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
print(f'\nTHONG KE CUOI CUNG:')
print(f'   - Vocabulary: {len(all_words):,} words')
print(f'   - Intents: {len(tags)} categories')
print(f'   - Training samples: {len(xy):,} patterns')
print(f'   - Model size: {hidden_size:,} neurons')
print(f'   - Training epochs: {num_epochs}')
print(f'\nCHATBOT GIO DAY THONG MINH CUC KY!')














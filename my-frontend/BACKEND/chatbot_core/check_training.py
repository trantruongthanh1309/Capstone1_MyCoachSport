"""Kiểm tra training có đang chạy và kết quả"""
import torch
import os
from datetime import datetime

print("=" * 70)
print("KIEM TRA TRAINING")
print("=" * 70)

f = 'data.pth'
if os.path.exists(f):
    d = torch.load(f, map_location='cpu')
    mtime = os.path.getmtime(f)
    hs = d.get('hidden_size', 0)
    
    print(f"\nMODEL:")
    print(f"  Hidden size: {hs}")
    print(f"  Tags: {len(d.get('tags', []))}")
    print(f"  Words: {len(d.get('all_words', []))}")
    print(f"  Last modified: {datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')}")
    
    if hs == 3072:
        print(f"\n  ✅ DA TRAIN XONG - SUPER MODEL (3072 neurons)")
    elif hs == 2048:
        print(f"\n  ⚠️ CHUA PHAI SUPER (chi co 2048, can 3072)")
    else:
        print(f"\n  ❌ CHUA TRAIN SUPER (chi co {hs} neurons)")
else:
    print("\n  ❌ MODEL FILE KHONG TON TAI")

print("\n" + "=" * 70)


















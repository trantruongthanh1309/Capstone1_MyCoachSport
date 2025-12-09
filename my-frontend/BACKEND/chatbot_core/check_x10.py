"""
Kiểm tra trạng thái training MEGA EXPERT
"""
import torch
import json
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE_DIR)

INTENTS_FILE = os.path.join(BASE_DIR, 'data', 'intents_mega.json')
MODEL_FILE = os.path.join(BASE_DIR, 'data.pth')


def check_training_data():
    """Kiểm tra training data"""
    print("\n1. TRAINING DATA:")
    if os.path.exists(INTENTS_FILE):
        with open(INTENTS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        total = sum(len(i.get('patterns', [])) for i in data.get('intents', []))
        intents_count = len(data.get('intents', []))
        print(f"   Intents: {intents_count}")
        print(f"   Patterns: {total:,}")
        if total >= 500000:
            print("   ✅ Đủ patterns (>= 500,000)")
            return True, total
        else:
            print(f"   ❌ Chưa đủ (cần >= 500,000)")
            return False, total
    else:
        print(f"   ❌ File không tồn tại: {INTENTS_FILE}")
        return False, 0


def check_model():
    """Kiểm tra model"""
    print("\n2. MODEL:")
    if os.path.exists(MODEL_FILE):
        try:
            data = torch.load(MODEL_FILE, map_location='cpu')
            hidden_size = data.get('hidden_size', 0)
            tags_count = len(data.get('tags', []))
            words_count = len(data.get('all_words', []))
            print(f"   Hidden size: {hidden_size}")
            print(f"   Tags: {tags_count}")
            print(f"   Words: {words_count}")
            if hidden_size == 2048:
                print("   ✅ MEGA EXPERT (2048 neurons)")
                return True, hidden_size
            else:
                print(f"   ❌ Chưa phải MEGA EXPERT (chỉ {hidden_size} neurons)")
                return False, hidden_size
        except Exception as e:
            print(f"   ❌ Lỗi: {e}")
            return False, 0
    else:
        print(f"   ❌ File không tồn tại: {MODEL_FILE}")
        return False, 0


def main():
    print("=" * 70)
    print("KIỂM TRA: ĐÃ THÔNG MINH X10 CHƯA?")
    print("=" * 70)
    
    data_ok, total_patterns = check_training_data()
    model_ok, hidden_size = check_model()
    
    print("\n3. KẾT LUẬN:")
    if model_ok and data_ok:
        print("   ✅✅✅ ĐÃ THÔNG MINH X10!")
        print(f"   - Model: {hidden_size} neurons (MEGA EXPERT)")
        print(f"   - Data: {total_patterns:,} patterns")
        print("   - Bước tiếp theo: Restart backend")
    else:
        print("   ❌ CHƯA THÔNG MINH X10")
        if not model_ok:
            print(f"      - Model: chỉ {hidden_size} neurons (cần 2048)")
        if not data_ok:
            print(f"      - Data: chỉ {total_patterns:,} patterns (cần >= 500,000)")
        print("   - Cần chạy: python train_mega_expert.py")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()

import json
import os
import json
import os
# from chatbot_core.train import train  <-- Bỏ dòng này

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEGA_FILE = os.path.join(BASE_DIR, 'chatbot_core', 'data', 'intents_mega.json')
EXTRA_FILE = os.path.join(BASE_DIR, 'chatbot_core', 'data', 'intents_extra.json')
ADVANCED_FILE = os.path.join(BASE_DIR, 'chatbot_core', 'data', 'intents_advanced.json')
EXPERT_FILE = os.path.join(BASE_DIR, 'chatbot_core', 'data', 'intents_expert.json')
MASTER_FILE = os.path.join(BASE_DIR, 'chatbot_core', 'data', 'intents_master.json')

def merge_intents():
    print("🔄 Đang merge intents...")
    
    with open(MEGA_FILE, 'r', encoding='utf-8') as f:
        mega_data = json.load(f)
    
    # Danh sách các file cần merge
    files_to_merge = [EXTRA_FILE, ADVANCED_FILE, EXPERT_FILE, MASTER_FILE]
    
    existing_tags = {intent['tag'] for intent in mega_data['intents']}
    total_added = 0
    
    for file_path in files_to_merge:
        if not os.path.exists(file_path):
            print(f"⚠️ File {file_path} không tồn tại, bỏ qua.")
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            extra_data = json.load(f)
        
        added_count = 0
        for intent in extra_data['intents']:
            if intent['tag'] not in existing_tags:
                mega_data['intents'].insert(0, intent)
                existing_tags.add(intent['tag'])
                added_count += 1
            else:
                print(f"⚠️ Tag '{intent['tag']}' đã tồn tại, bỏ qua.")
        
        print(f"✅ Đã thêm {added_count} intents từ {os.path.basename(file_path)}")
        total_added += added_count
            
    # Lưu lại file mega
    with open(MEGA_FILE, 'w', encoding='utf-8') as f:
        json.dump(mega_data, f, ensure_ascii=False, indent=2)
        
    print(f"\n✅ Tổng cộng đã thêm {total_added} intents mới vào intents_mega.json")

if __name__ == "__main__":
    merge_intents()
    print("\n🚀 Bắt đầu train lại model...")
    # Chạy script train.py bằng subprocess để đảm bảo đúng context
    import subprocess
    train_script = os.path.join(BASE_DIR, "chatbot_core", "train.py")
    chatbot_core_dir = os.path.join(BASE_DIR, "chatbot_core")
    
    subprocess.run(["python", train_script], cwd=chatbot_core_dir, shell=True)

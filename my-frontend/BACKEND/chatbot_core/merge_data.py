import json

# Đọc file cũ
with open('intents.json', 'r', encoding='utf-8') as f:
    old_data = json.load(f)

# Đọc file mới
with open('intents_extended.json', 'r', encoding='utf-8') as f:
    new_data = json.load(f)

# Merge
merged_intents = old_data['intents'] + new_data['intents']

merged_data = {
    "intents": merged_intents
}

# Lưu file merged
with open('intents_full.json', 'w', encoding='utf-8') as f:
    json.dump(merged_data, f, ensure_ascii=False, indent=4)

total_patterns = sum(len(intent['patterns']) for intent in merged_intents)
print(f"✅ Đã merge thành công!")
print(f"📊 Tổng số intents: {len(merged_intents)}")
print(f"📊 Tổng số patterns: {total_patterns}")
print(f"💾 File đã lưu: intents_full.json")

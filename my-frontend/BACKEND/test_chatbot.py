# -*- coding: utf-8 -*-
"""
Script test chatbot nhanh
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chatbot_core.chat_service import get_response

# Fake user context để test
test_user = {
    "name": "Dũng",
    "id": 1,
    "sport": "Gym",
    "goal": "Tăng cơ",
    "age": 25,
    "sex": "Male",
    "height": 175,
    "weight": 70
}

print("=" * 60)
print("🤖 CHATBOT TEST - MySportCoach AI")
print("=" * 60)
print("Nhập 'quit' hoặc 'exit' để thoát\n")

while True:
    user_input = input("Bạn: ")
    
    if user_input.lower() in ['quit', 'exit', 'thoát']:
        print("👋 Tạm biệt! Hẹn gặp lại!")
        break
    
    if not user_input.strip():
        continue
    
    response = get_response(user_input, test_user)
    print(f"🤖 Bot: {response}\n")

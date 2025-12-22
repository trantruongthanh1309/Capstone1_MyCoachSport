# -*- coding: utf-8 -*-
"""
Bad words filter for comments and posts
"""

# Danh sách từ ngữ khiếm nhã (Tiếng Việt và Tiếng Anh)
BAD_WORDS = [
    # Tiếng Việt
    'địt', 'đụ', 'đéo', 'đm', 'dm', 'đmm', 'clmm', 'clgt', 'vl', 'vcl', 'vkl',
    'lồn', 'buồi', 'dái', 'cặc', 'cặt', 'dick', 'pussy', 'asshole', 'bitch',
    'đồ ngu', 'đồ chó', 'đồ súc vật', 'đồ khùng', 'đồ điên',
    'fuck', 'shit', 'damn', 'hell', 'crap', 'bastard', 'idiot', 'stupid',
    'ngu si', 'ngu xuẩn', 'đần độn', 'thiểu năng',
    'đồ con hoang', 'đồ khốn', 'đồ súc vật', 'đồ khốn nạn',
    'cút', 'biến đi', 'đi chết đi',
    # Thêm các từ khác nếu cần
    'đồ chết tiệt', 'đồ mất dạy', 'đồ vô văn hóa'
]

def contains_bad_words(text):
    """
    Kiểm tra xem text có chứa từ ngữ khiếm nhã không
    Returns: (bool, str) - (has_bad_words, bad_word_found)
    """
    if not text:
        return False, None
    
    text_lower = text.lower().strip()
    
    # Loại bỏ dấu câu và ký tự đặc biệt để dễ so sánh
    import re
    text_clean = re.sub(r'[^\w\s]', '', text_lower)
    words = text_clean.split()
    
    for bad_word in BAD_WORDS:
        # Kiểm tra từ đơn
        if bad_word in words:
            return True, bad_word
        # Kiểm tra từ trong chuỗi (tránh bypass bằng cách thêm ký tự)
        if bad_word in text_lower:
            return True, bad_word
    
    return False, None

def filter_bad_words(text):
    """
    Thay thế từ ngữ khiếm nhã bằng dấu *
    """
    if not text:
        return text
    
    result = text
    text_lower = text.lower()
    
    for bad_word in BAD_WORDS:
        # Tìm và thay thế (case-insensitive)
        import re
        pattern = re.compile(re.escape(bad_word), re.IGNORECASE)
        result = pattern.sub('*' * len(bad_word), result)
    
    return result






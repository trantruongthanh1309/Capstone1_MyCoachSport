import numpy as np
import nltk
from nltk.stem.porter import PorterStemmer

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

stemmer = PorterStemmer()

def tokenize(sentence):
    """
    Chia câu thành các từ (tokens).
    Ví dụ: "Làm sao để giảm cân?" -> ["Làm", "sao", "để", "giảm", "cân", "?"]
    """
    return nltk.word_tokenize(sentence)

def stem(word):
    """
    Tìm gốc từ (stemming). 
    Ví dụ: "running" -> "run". 
    Với tiếng Việt thì hiệu quả thấp hơn tiếng Anh nhưng vẫn giúp chuẩn hóa.
    """
    return stemmer.stem(word.lower())

def bag_of_words(tokenized_sentence, words):
    """
    Tạo vector Bag of Words:
    Trả về mảng: [1, 0, 1, ...] với 1 là từ có xuất hiện trong words, 0 là không.
    """
    sentence_words = [stem(word) for word in tokenized_sentence]
    
    bag = np.zeros(len(words), dtype=np.float32)
    
    for idx, w in enumerate(words):
        if w in sentence_words: 
            bag[idx] = 1

    return bag

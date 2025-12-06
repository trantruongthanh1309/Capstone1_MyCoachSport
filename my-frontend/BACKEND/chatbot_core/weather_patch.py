# Patch for weather integration
import chatbot_core.chat_service as chat_service
from chatbot_core.weather_handler import handle_weather_query

# Add weather handler to INTENT_HANDLERS
chat_service.INTENT_HANDLERS['weather_query'] = lambda user_context: "Bạn muốn kiểm tra thời tiết ở đâu?"

print("✅ Weather handler patched!")

# Monkey patch get_response to handle weather with message context
original_get_response = chat_service.get_response

def get_response_with_weather(msg, user_context=None):
    """Enhanced get_response with weather support"""
    import torch
    from chatbot_core.nltk_utils import bag_of_words, tokenize
    
    if not chat_service.model:
        return "Hệ thống đang bảo trì (Chưa train model)."
    
    # Predict intent
    sentence = tokenize(msg)
    X = bag_of_words(sentence, chat_service.all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(chat_service.device)
    
    output = chat_service.model(X)
    _, predicted = torch.max(output, dim=1)
    tag = chat_service.tags[predicted.item()]
    
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    
    # If weather query detected
    if prob.item() > 0.75 and tag == 'weather_query':
        return handle_weather_query(user_context, msg)
    
    # Otherwise use original logic
    return original_get_response(msg, user_context)

chat_service.get_response = get_response_with_weather
print("✅ Enhanced get_response with weather!")

from app import app
from models.user_model import User
from db import db

def test_unicode():
    with app.app_context():
        try:
            print("--- Testing Unicode Support ---")
            
            # Create a dummy user with Vietnamese characters to test
            # Using a raw SQL insert or model if possible, but let's query first
            
            # Check existing users
            users = User.query.limit(5).all()
            for u in users:
                print(f"ID: {u.Id}, Name: {u.Name} (Type: {type(u.Name)})")
                
            print("--- End Test ---")
        except Exception as e:
            print(f"CRITICAL ERROR: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_unicode()

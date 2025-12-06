import sys
import os

# Add parent directory to path to import app and models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from db import db
from models.user_model import User
from models.meal import Meal
from models.workout import Workout
from models.post import Post
from models.log import Log
from models.feedback import Feedback
from models.system_setting import SystemSetting

def create_tables():
    with app.app_context():
        print("Creating missing tables...")
        try:
            db.create_all()
            print("✅ All tables created successfully!")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")

if __name__ == "__main__":
    create_tables()

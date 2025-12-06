
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from db import db
from sqlalchemy import text

def update_schema():
    with app.app_context():
        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('Users')]
        
        if 'CreatedAt' not in columns:
            print("Adding CreatedAt column to Users table...")
            try:
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE Users ADD COLUMN CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP"))
                    conn.commit()
                print("Successfully added CreatedAt column.")
            except Exception as e:
                print(f"Error adding column: {e}")
        else:
            print("CreatedAt column already exists in Users table.")

if __name__ == "__main__":
    update_schema()

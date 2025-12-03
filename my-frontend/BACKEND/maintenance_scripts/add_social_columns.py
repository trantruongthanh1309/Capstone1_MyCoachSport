from app import app
from db import db
from sqlalchemy import text

def add_column_if_not_exists(table, column, type_def):
    try:
        # Check if column exists
        check_sql = text(f"SELECT COL_LENGTH('{table}', '{column}')")
        result = db.session.execute(check_sql).scalar()
        
        if result is None:
            print(f"➕ Adding column {column} to {table}...")
            alter_sql = text(f"ALTER TABLE {table} ADD {column} {type_def}")
            db.session.execute(alter_sql)
            db.session.commit()
            print(f"✅ Added {column} successfully!")
        else:
            print(f"ℹ️ Column {column} already exists in {table}.")
            
    except Exception as e:
        print(f"❌ Error adding {column}: {e}")
        db.session.rollback()

with app.app_context():
    print("🚀 Starting migration...")
    
    # Add columns to SocialPosts
    add_column_if_not_exists('SocialPosts', 'Title', 'NVARCHAR(255)')
    add_column_if_not_exists('SocialPosts', 'Sport', 'NVARCHAR(50)')
    add_column_if_not_exists('SocialPosts', 'Topic', 'NVARCHAR(50)')
    
    print("🏁 Migration completed!")

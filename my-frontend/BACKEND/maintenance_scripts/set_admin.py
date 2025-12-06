import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from db import db
from models.account_model import Account
from models.user_model import User

def set_user_as_admin(email):
    """Set user role to admin by email"""
    with app.app_context():
        try:
            user = User.query.filter_by(Email=email).first()
            if not user:
                print(f"❌ User with email '{email}' not found!")
                return
            
            account = Account.query.filter_by(User_id=user.Id).first()
            if not account:
                print(f"❌ No account found for user {user.Name}")
                return
            
            old_role = account.Role
            account.Role = 'admin'
            db.session.commit()
            
            print(f"✅ User '{user.Name}' ({email})")
            print(f"   Role changed: {old_role} → admin")
            print(f"   User ID: {user.Id}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python set_admin.py <email>")
        print("Example: python set_admin.py admin@example.com")
    else:
        email = sys.argv[1]
        set_user_as_admin(email)

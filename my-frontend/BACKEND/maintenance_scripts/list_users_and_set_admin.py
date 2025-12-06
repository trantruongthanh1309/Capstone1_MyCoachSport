import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from db import db
from models.account_model import Account
from models.user_model import User

def list_and_set_admin():
    """List all users and set first one as admin"""
    with app.app_context():
        try:
            # Get all users
            users = User.query.all()
            
            if not users:
                print("❌ No users found in database!")
                print("Please register a user first at http://localhost:5173/register")
                return
            
            print(f"\n📋 Found {len(users)} users:")
            print("-" * 60)
            
            for i, user in enumerate(users, 1):
                account = Account.query.filter_by(User_id=user.Id).first()
                role = account.Role if account else "NO ACCOUNT"
                print(f"{i}. {user.Name} ({user.Email}) - Role: {role}")
            
            print("-" * 60)
            
            # Set first user as admin
            if users:
                first_user = users[0]
                account = Account.query.filter_by(User_id=first_user.Id).first()
                
                if account:
                    old_role = account.Role
                    account.Role = 'admin'
                    db.session.commit()
                    print(f"\n✅ Set '{first_user.Name}' ({first_user.Email}) as admin")
                    print(f"   Role: {old_role} → admin")
                    print(f"\n🔑 Now login with this account to access admin panel!")
                else:
                    print(f"\n❌ No account found for {first_user.Name}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()

if __name__ == "__main__":
    list_and_set_admin()

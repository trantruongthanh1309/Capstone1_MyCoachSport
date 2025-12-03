from app import app
from models import Account

def check_admins():
    with app.app_context():
        admins = Account.query.filter((Account.Role == 'admin') | (Account.Role == 'manager')).all()
        if admins:
            print(f"Found {len(admins)} admin(s):")
            for admin in admins:
                print(f"- Email: {admin.Email}, Role: {admin.Role}, Password: {admin.Password}")
        else:
            print("No admin accounts found!")

if __name__ == "__main__":
    check_admins()

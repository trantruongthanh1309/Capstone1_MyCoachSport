try:
    from app import app, db
    # Directly import from the file to avoid circular issues or __init__ confusion
    from models.user_plan import UserPlan

    def clear_plans():
        with app.app_context():
            try:
                # Use text query as fallback if model import fails, but model is preferred
                num_deleted = db.session.query(UserPlan).delete()
                # Or raw sql: db.session.execute('DELETE FROM UserPlans')
                db.session.commit()
                print(f"Successfully deleted {num_deleted} UserPlan records.")
            except Exception as e:
                db.session.rollback()
                print(f"Error: {e}")

    if __name__ == '__main__':
        clear_plans()
except Exception as e:
    print(e)





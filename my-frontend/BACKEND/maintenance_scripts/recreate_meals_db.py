from app import app, db
from models.meal import Meal

with app.app_context():
    print("Dropping Meals table...")
    # SQL way to be sure, or using SQLAlchemy metadata
    try:
        Meal.__table__.drop(db.engine)
        print("Meals table dropped.")
    except Exception as e:
        print(f"Error dropping table (might not exist): {e}")

    print("Recreating Meals table...")
    try:
        db.create_all()
        print("Meals table recreated successfully with new schema!")
        print("Columns: Id, Name, Kcal, Protein, Carb, Fat, ServingSize, SuitableSports, MealTime, Ingredients, Recipe, CookingTimeMin, Difficulty, Image")
    except Exception as e:
        print(f"Error creating table: {e}")





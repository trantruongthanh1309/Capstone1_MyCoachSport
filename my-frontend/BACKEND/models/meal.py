from db import db

class Meal(db.Model):
    __tablename__ = 'Meals'

    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    
    # Nutrition
    Kcal = db.Column(db.Integer, nullable=False)
    Protein = db.Column(db.Float, nullable=False)
    Carb = db.Column(db.Float, nullable=False)
    Fat = db.Column(db.Float, nullable=False)
    ServingSize = db.Column(db.String(100)) # e.g. "100g", "1 bowl"

    # Suitability & Timing
    SuitableSports = db.Column(db.String(500)) # e.g. "Gym, Yoga, Cardio"
    MealTime = db.Column(db.String(100)) # "Breakfast", "Lunch", "Dinner"

    # Content
    Ingredients = db.Column(db.Text) # Detailed list
    Recipe = db.Column(db.Text) # Cooking instructions
    CookingTimeMin = db.Column(db.Integer)
    Difficulty = db.Column(db.String(50)) # Easy, Medium, Hard
    VideoUrl = db.Column(db.String(500)) # YouTube video URL for cooking guide
    
    Image = db.Column(db.String(500))

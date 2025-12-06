from db import db
class Meal(db.Model):
    __tablename__ = 'Meals'

    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(200))
    Kcal = db.Column(db.Integer)
    Protein = db.Column(db.Integer)
    Carb = db.Column(db.Integer)
    Fat = db.Column(db.Integer)
    Tags = db.Column(db.String(200))
    
    IngredientTags = db.Column(db.String(500))
    SportTags = db.Column(db.String(200))
    MealType = db.Column(db.String(50))
    
    MealTiming = db.Column(db.String(100))
    CookingTimeMin = db.Column(db.Integer)
    Image = db.Column(db.String(500))

# models/meal.py
from db import db
class Meal(db.Model):
    __tablename__ = 'Meals'

    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(200))
    Kcal = db.Column(db.Integer)
    Protein = db.Column(db.Integer)
    Carb = db.Column(db.Integer)
    Fat = db.Column(db.Integer)
    Tags = db.Column(db.String(200))             # Tag tổng hợp, ví dụ "basketball,high-protein"
    
    # ✅ Các trường cần thêm
    IngredientTags = db.Column(db.String(500))   # Danh sách nguyên liệu (VD: "chicken,rice,broccoli")
    SportTags = db.Column(db.String(200))        # Môn thể thao phù hợp (VD: "football,basketball")
    MealType = db.Column(db.String(50))          # Loại bữa (VD: "breakfast","lunch","dinner","snack")
    
    # New AI fields
    MealTiming = db.Column(db.String(100))       # Thời điểm ăn (PreWorkout, PostWorkout...)
    CookingTimeMin = db.Column(db.Integer)       # Thời gian nấu (phút)
    Image = db.Column(db.String(500))            # URL ảnh món ăn

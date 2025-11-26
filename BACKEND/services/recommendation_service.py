from db import db
from models import Meal, Workout, UserSchedule, User, Log
from datetime import datetime
import random
import json
import hashlib

class SmartRecommendationEngine:
    def __init__(self, user_id, date_str):
        self.user_id = user_id
        self.date_str = date_str
        self.date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        self.day_of_week = self.date_obj.weekday()
        self.day_map = {0: "mon", 1: "tue", 2: "wed", 3: "thu", 4: "fri", 5: "sat", 6: "sun"}
        
        self.user = db.session.query(User).filter(User.Id == user_id).first()
        if not self.user:
            raise ValueError("User not found")

        self.allergies = self._parse_list(self.user.Allergies)
        self.disliked = self._parse_list(self.user.DislikedIngredients)
        self.forbidden_ingredients = set(a.lower() for a in self.allergies + self.disliked)

    def _parse_list(self, json_str):
        try:
            if not json_str: return []
            return json.loads(json_str)
        except:
            return []

    def _get_busy_slots(self):
        weekday_key = self.day_map[self.day_of_week]
        schedules = UserSchedule.query.filter_by(User_id=self.user_id, DayOfWeek=weekday_key).all()
        
        busy = set()
        for s in schedules:
            if s.Period and s.Note and s.Note.strip():
                busy.add(s.Period.lower())
        return busy

    def _score_workout(self, workout, slot):
        score = 50
        
        user_sport = (self.user.Sport or "").lower()
        if user_sport and user_sport in (workout.Sport or "").lower():
            score += 30
            
        goal = (self.user.Goal or "").lower()
        w_name = (workout.Name or "").lower()
        w_intensity = (workout.Intensity or "").lower()

        if "tăng cơ" in goal:
            if "gym" in w_name or "tạ" in w_name or w_intensity == "cao":
                score += 20
        elif "giảm cân" in goal:
            if "cardio" in w_name or "hiit" in w_name or "chạy" in w_name:
                score += 20

        score += random.randint(-5, 5)
        return score

    def _score_meal(self, meal, time_slot):
        if meal.IngredientTags:
            ingredients = set(i.strip().lower() for i in meal.IngredientTags.split(','))
            if ingredients & self.forbidden_ingredients:
                return -1000

        score = 50
        
        user_sport = (self.user.Sport or "").lower()
        if meal.SportTags and user_sport:
            sport_tags = set(s.strip().lower() for s in meal.SportTags.split(','))
            if user_sport in sport_tags:
                score += 25

        meal_type = (meal.MealType or "").lower()
        if time_slot == "morning":
            if any(x in meal_type for x in ["morning", "breakfast", "sáng"]):
                score += 30
            elif any(x in meal_type for x in ["evening", "dinner", "tối"]):
                score -= 20
        elif time_slot == "afternoon":
            if any(x in meal_type for x in ["lunch", "afternoon", "trưa"]):
                score += 30
        elif time_slot == "evening":
            if any(x in meal_type for x in ["dinner", "evening", "tối"]):
                score += 30
            elif any(x in meal_type for x in ["morning", "breakfast", "sáng"]):
                score -= 20

        goal = (self.user.Goal or "").lower()
        kcal = meal.Kcal or 0
        protein = meal.Protein or 0
        
        if "giảm cân" in goal:
            if kcal < 500 and protein > 20:
                score += 20
        elif "tăng cơ" in goal:
            if protein > 25:
                score += 20

        score += random.randint(-10, 10)
        return score

    def _load_existing_schedule(self):
        items = UserSchedule.query.filter_by(
            User_id=self.user_id,
            Date=self.date_obj
        ).all()
        
        if not items:
            return None
            
        schedule = []
        time_map = {
            "morning": "07:00 - 08:00",
            "afternoon": "12:00 - 13:00",
            "evening": "19:00 - 20:00"
        }
        
        for item in items:
            if item.MealId:
                meal = Meal.query.get(item.MealId)
                if meal:
                    meal_data = self._serialize_meal(meal)
                    meal_data["MealType"] = item.Period
                    schedule.append({
                        "time": time_map.get(item.Period, item.Period),
                        "type": "meal",
                        "data": meal_data
                    })
            elif item.WorkoutId:
                workout = Workout.query.get(item.WorkoutId)
                if workout:
                    schedule.append({
                        "time": f"{item.Period}_slot",
                        "type": "workout",
                        "data": self._serialize_workout(workout)
                    })
        
        return {
            "date": self.date_str,
            "user_id": self.user_id,
            "schedule": schedule
        }

    def _save_schedule(self, schedule_items):
        UserSchedule.query.filter_by(
            User_id=self.user_id,
            Date=self.date_obj
        ).delete()
        
        for item in schedule_items:
            if item["type"] == "meal":
                time_slot = None
                if "07:00" in item["time"]:
                    time_slot = "morning"
                elif "12:00" in item["time"]:
                    time_slot = "afternoon"
                elif "19:00" in item["time"]:
                    time_slot = "evening"
                    
                if time_slot:
                    new_item = UserSchedule(
                        User_id=self.user_id,
                        Date=self.date_obj,
                        Period=time_slot,
                        MealId=item["data"]["Id"]
                    )
                    db.session.add(new_item)
                    
            elif item["type"] == "workout":
                time_slot = item["time"].replace("_slot", "")
                new_item = UserSchedule(
                    User_id=self.user_id,
                    Date=self.date_obj,
                    Period=time_slot,
                    WorkoutId=item["data"]["Id"]
                )
                db.session.add(new_item)
        
        db.session.commit()

    def generate_plan(self):
        existing = self._load_existing_schedule()
        if existing:
            return existing
        
        seed_val = int(hashlib.md5(f"{self.user_id}_{self.date_str}".encode()).hexdigest(), 16) % (2**32)
        random.seed(seed_val)

        busy_slots = self._get_busy_slots()
        schedule = []
        
        workout_slot = None
        priority_slots = ["afternoon", "morning", "evening"]
        random.shuffle(priority_slots)

        for slot in priority_slots:
            if slot not in busy_slots:
                workout_slot = slot
                break
        
        selected_workout = None
        if workout_slot:
            all_workouts = Workout.query.all()
            scored_workouts = [(w, self._score_workout(w, workout_slot)) for w in all_workouts]
            scored_workouts.sort(key=lambda x: x[1], reverse=True)
            
            top_workouts = scored_workouts[:5]
            if top_workouts:
                selected_workout = random.choice(top_workouts)[0]
                schedule.append({
                    "time": f"{workout_slot}_slot",
                    "type": "workout",
                    "data": self._serialize_workout(selected_workout)
                })

        periods = ["morning", "afternoon", "evening"]
        time_map = {
            "morning": "07:00 - 08:00",
            "afternoon": "12:00 - 13:00",
            "evening": "19:00 - 20:00"
        }

        all_meals = Meal.query.all()

        for period in periods:
            if period in busy_slots:
                continue
                
            candidate_meals = []
            for m in all_meals:
                s = self._score_meal(m, period)
                if s > 0:
                    candidate_meals.append((m, s))
            
            if not candidate_meals:
                candidate_meals = [(m, self._score_meal(m, "normal")) for m in all_meals]

            candidate_meals.sort(key=lambda x: x[1], reverse=True)
            top_choices = candidate_meals[:15]
            
            if top_choices:
                chosen_meal = random.choice(top_choices)[0]
                
                meal_data = self._serialize_meal(chosen_meal)
                meal_data["MealType"] = period
                
                schedule.append({
                    "time": time_map[period],
                    "type": "meal",
                    "data": meal_data
                })

        self._save_schedule(schedule)

        return {
            "date": self.date_str,
            "user_id": self.user_id,
            "schedule": schedule
        }

    def _serialize_meal(self, m):
        return {
            "Id": m.Id,
            "Name": m.Name,
            "Kcal": m.Kcal,
            "Protein": m.Protein,
            "Carb": m.Carb,
            "Fat": m.Fat,
            "Image": getattr(m, 'Image', None)
        }

    def _serialize_workout(self, w):
        return {
            "Id": w.Id,
            "Name": w.Name,
            "Sport": w.Sport,
            "Intensity": w.Intensity,
            "Duration_min": w.Duration_min,
            "VideoUrl": getattr(w, 'VideoUrl', None)
        }

def build_daily_schedule(user_id, date_str):
    engine = SmartRecommendationEngine(user_id, date_str)
    return engine.generate_plan()
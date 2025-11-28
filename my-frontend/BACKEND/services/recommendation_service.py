from db import db
from models import Meal, Workout, UserSchedule, User, Log, UserPlan
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
        # Vẫn đọc lịch bận từ UserSchedule như cũ
        weekday_key = self.day_map[self.day_of_week]
        schedules = UserSchedule.query.filter_by(User_id=self.user_id, DayOfWeek=weekday_key).all()
        
        print(f"🔍 [BUSY CHECK] User {self.user_id}, Date: {self.date_str}, Weekday: {weekday_key}")
        
        busy = set()
        for s in schedules:
            if s.Period and s.Note and s.Note.strip():
                busy.add(s.Period.lower())
                print(f"   ⛔ Busy slot: {s.Period} - '{s.Note}'")
        
        print(f"   📋 Total busy slots: {busy}")
        return busy

    def _score_workout(self, workout, slot):
        score = 50
        
        # 1. Sport Match (Quan trọng nhất: +50)
        user_sport = (self.user.Sport or "").lower()
        workout_sport_tags = (workout.SportTags or "").lower()
        
        if user_sport and user_sport in workout_sport_tags:
            score += 50
        elif "general" in workout_sport_tags:
            score += 20 # Bài tập chung cũng tốt

        # 2. Goal Match (Mục tiêu: +30)
        user_goal = (self.user.Goal or "").lower()
        workout_goal = (workout.GoalFocus or "").lower()
        
        if "tăng cơ" in user_goal:
            if "sức mạnh" in workout_goal or "cơ lõi" in workout_goal:
                score += 30
        elif "giảm cân" in user_goal:
            if "tim mạch" in workout_goal or "toàn thân" in workout_goal or "tốc độ" in workout_goal:
                score += 30
            # Ưu tiên bài đốt calo cao
            if workout.CalorieBurn and workout.CalorieBurn > 200:
                score += 15

        # 3. Difficulty Match (Trình độ: +20)
        # Giả định user mới là Beginner, tập lâu là Intermediate/Advanced
        # Tạm thời ưu tiên Beginner/Intermediate cho an toàn
        workout_diff = (workout.Difficulty or "Beginner").lower()
        if workout_diff in ["beginner", "intermediate"]:
            score += 20
        
        # 4. Intensity & Slot
        # Buổi sáng ưu tiên cường độ vừa/cao để tỉnh táo
        if slot == "morning" and "cao" in (workout.Intensity or "").lower():
            score += 10
            
        score += random.randint(-5, 5)
        return score

    def _score_meal(self, meal, time_slot):
        # 1. Allergy Check (Tuyệt đối)
        if meal.IngredientTags:
            ingredients = set(i.strip().lower() for i in meal.IngredientTags.split(','))
            if ingredients & self.forbidden_ingredients:
                return -1000

        score = 50
        
        # 2. Timing Match (Quan trọng nhất: +40)
        # Kiểm tra cả MealTiming (AI mới) và MealType (Dữ liệu cũ)
        meal_timing = (meal.MealTiming or "").lower()
        meal_type = (meal.MealType or "").lower()
        
        is_timing_match = False
        
        if time_slot == "morning":
            if "breakfast" in meal_timing or "preworkout" in meal_timing:
                is_timing_match = True
            elif "morning" in meal_type or "sáng" in meal_type or "breakfast" in meal_type:
                is_timing_match = True
                
            # Phạt nặng nếu món tối ăn sáng
            if "dinner" in meal_timing or "evening" in meal_type or "tối" in meal_type:
                score -= 100
                
        elif time_slot == "afternoon":
            if "lunch" in meal_timing:
                is_timing_match = True
            elif "afternoon" in meal_type or "lunch" in meal_type or "trưa" in meal_type:
                is_timing_match = True
                
        elif time_slot == "evening":
            if "dinner" in meal_timing:
                is_timing_match = True
            elif "evening" in meal_type or "dinner" in meal_type or "tối" in meal_type:
                is_timing_match = True
                
            # Phạt nặng nếu món sáng ăn tối (như Xôi)
            if "breakfast" in meal_timing or "morning" in meal_type or "sáng" in meal_type:
                score -= 100

        if is_timing_match:
            score += 40
        else:
            # Nếu không đúng buổi, trừ điểm nặng để hạn chế chọn
            score -= 20
        
        # 3. Sport Support (+20)
        user_sport = (self.user.Sport or "").lower()
        if meal.SportTags and user_sport:
            sport_tags = set(s.strip().lower() for s in meal.SportTags.split(','))
            if user_sport in sport_tags:
                score += 20

        # 4. Goal Optimization (+30)
        user_goal = (self.user.Goal or "").lower()
        kcal = meal.Kcal or 0
        protein = meal.Protein or 0
        
        if "giảm cân" in user_goal:
            # Ưu tiên ít calo, giàu protein để no lâu
            if kcal < 500 and protein > 20:
                score += 30
            elif kcal < 400:
                score += 20
        elif "tăng cơ" in user_goal:
            # Ưu tiên protein cao
            if protein > 30:
                score += 30
            elif protein > 20:
                score += 15

        score += random.randint(-10, 10)
        return score

    def _get_user_profile_hash(self):
        """Tạo hash từ thông tin user để phát hiện thay đổi"""
        profile_str = f"{self.user.Sport}_{self.user.Goal}_{self.user.Allergies}_{self.user.DislikedIngredients}"
        return hashlib.md5(profile_str.encode()).hexdigest()
    
    def _has_profile_changed(self):
        """Kiểm tra xem user có thay đổi Sport, Goal, Allergies không"""
        # Lấy lịch đã lưu
        existing_items = UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).first()
        
        if not existing_items:
            return False
            
        # Kiểm tra ProfileHash
        current_hash = self._get_user_profile_hash()
        saved_hash = existing_items.ProfileHash if hasattr(existing_items, 'ProfileHash') else None
        
        if saved_hash and saved_hash != current_hash:
            print(f"🔄 [PROFILE CHANGED] User {self.user_id} profile changed, regenerating schedule...")
            return True
        return False
    
    def _load_existing_schedule(self):
        """Đọc lịch đã lưu và LUÔN LUÔN kiểm tra busy slots"""
        # Kiểm tra xem profile có thay đổi không
        if self._has_profile_changed():
            print("   ⚠️ Profile changed, will regenerate schedule")
            return None
        
        # Đọc từ bảng UserPlans (Lịch tập/ăn cố định)
        items = UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).all()
        
        if not items:
            return None
        
        # ✅ LUÔN LUÔN kiểm tra busy slots, ngay cả với lịch đã lưu
        busy_slots = self._get_busy_slots()
        
        schedule = []
        time_map = {
            "morning": "07:00 - 08:00",
            "afternoon": "12:00 - 13:00",
            "evening": "19:00 - 20:00"
        }
        
        filtered_count = 0
        
        for item in items:
            # ✅ Bỏ qua các item trùng với busy slots
            if item.Slot and item.Slot.lower() in busy_slots:
                filtered_count += 1
                print(f"   🚫 Filtered out {item.Type} at {item.Slot} (busy)")
                continue
            
            if item.Type == "meal" and item.MealId:
                meal = Meal.query.get(item.MealId)
                if meal:
                    meal_data = self._serialize_meal(meal)
                    meal_data["MealType"] = item.Slot
                    schedule.append({
                        "time": time_map.get(item.Slot, item.Slot),
                        "type": "meal",
                        "data": meal_data
                    })
            elif item.Type == "workout" and item.WorkoutId:
                workout = Workout.query.get(item.WorkoutId)
                if workout:
                    schedule.append({
                        "time": f"{item.Slot}_slot",
                        "type": "workout",
                        "data": self._serialize_workout(workout)
                    })
        
        # ✅ Nếu có item bị filter do busy, XÓA và TẠO LẠI lịch
        if filtered_count > 0:
            print(f"   🔄 {filtered_count} items conflict with busy slots, regenerating schedule...")
            return None
        
        if not schedule:
            return None
        
        return {
            "date": self.date_str,
            "user_id": self.user_id,
            "schedule": schedule
        }

    def _save_schedule(self, schedule_items):
        # Xóa lịch cũ trong UserPlans nếu có (để cập nhật mới)
        UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).delete()
        
        # Lấy profile hash hiện tại
        profile_hash = self._get_user_profile_hash()
        
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
                    new_item = UserPlan(
                        UserId=self.user_id,
                        Date=self.date_obj,
                        Slot=time_slot,
                        Type="meal",
                        MealId=item["data"]["Id"],
                        ProfileHash=profile_hash
                    )
                    db.session.add(new_item)
                    
            elif item["type"] == "workout":
                time_slot = item["time"].replace("_slot", "")
                new_item = UserPlan(
                    UserId=self.user_id,
                    Date=self.date_obj,
                    Slot=time_slot,
                    Type="workout",
                    WorkoutId=item["data"]["Id"],
                    ProfileHash=profile_hash
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
        
        print(f"💪 [WORKOUT] Checking workout slots...")
        workout_slot = None
        
        # ✅ FIX: Ưu tiên Sáng -> Tối -> Chiều để lịch tập đều đặn, không bị lỏm chỏm
        priority_slots = ["morning", "evening", "afternoon"]
        
        for slot in priority_slots:
            if slot not in busy_slots:
                workout_slot = slot
                print(f"   ✅ Selected workout slot: {slot}")
                break
            else:
                print(f"   ⏭️ Skipped {slot} (busy)")
        
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
                print(f"   ⏭️ Skipped meal {period} (busy)")
                continue
            print(f"   🍽️ Generating meal for {period}...")
                
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
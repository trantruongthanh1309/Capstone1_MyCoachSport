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

        self.liked_meals = set()
        self.disliked_meals = set()
        self.liked_workouts = set()
        self.disliked_workouts = set()
        self._load_preferences()

    def _load_preferences(self):
        """Đọc logs để biết user thích/ghét gì"""
        logs = Log.query.filter_by(User_id=self.user_id).all()
        for log in logs:
            if log.FeedbackType == 'liked':
                if log.Meal_id: self.liked_meals.add(log.Meal_id)
                if log.Workout_id: self.liked_workouts.add(log.Workout_id)
            elif log.FeedbackType == 'disliked':
                if log.Meal_id: self.disliked_meals.add(log.Meal_id)
                if log.Workout_id: self.disliked_workouts.add(log.Workout_id)
        
        print(f"❤️ [PREFERENCES] User {self.user_id}:")
        print(f"   👍 Liked Meals: {self.liked_meals}")
        print(f"   👎 Disliked Meals: {self.disliked_meals}")

    def _parse_list(self, json_str):
        try:
            if not json_str: return []
            return json.loads(json_str)
        except:
            return []

    def _get_busy_slots(self):
        weekday_key = self.day_map[self.day_of_week]
        schedules = UserSchedule.query.filter_by(User_id=self.user_id, DayOfWeek=weekday_key).all()
        
        print(f"🔍 [BUSY CHECK] User {self.user_id}, Date: {self.date_str}, Weekday: {weekday_key}")
        
        # Mapping Vietnamese to English
        period_map = {
            "buổi sáng": "morning",
            "sáng": "morning",
            "morning": "morning",
            "buổi trưa": "afternoon",
            "trưa": "afternoon",
            "afternoon": "afternoon",
            "buổi tối": "evening",
            "tối": "evening",
            "evening": "evening"
        }
        
        busy = set()
        for s in schedules:
            if s.Period and s.Note and s.Note.strip():
                # Normalize period name
                period_lower = s.Period.lower().strip()
                normalized_period = period_map.get(period_lower, period_lower)
                busy.add(normalized_period)
                print(f"   ⛔ Busy slot: {s.Period} ({normalized_period}) - '{s.Note}'")
        
        print(f"   📋 Total busy slots: {busy}")
        return busy

    def _score_workout(self, workout, slot):
        if workout.Id in self.disliked_workouts:
            return -1000
        
        score = 50
        
        # Liked workouts bonus
        if workout.Id in self.liked_workouts:
            score += 50
        
        # Sport matching (use AITags if available)
        user_sport = (self.user.Sport or "").lower()
        workout_aitags = (getattr(workout, 'AITags', '') or "").lower()
        workout_sport = (workout.Sport or "").lower()
        
        if user_sport:
            if user_sport in workout_aitags or user_sport in workout_sport:
                score += 50
            elif "general" in workout_aitags or "tất cả" in workout_aitags:
                score += 20
        
        # Goal matching (use Goals field)
        user_goal = (self.user.Goal or "").lower()
        workout_goals = (getattr(workout, 'Goals', '') or getattr(workout, 'GoalFocus', '') or "").lower()
        
        if "tăng cơ" in user_goal:
            if "sức mạnh" in workout_goals or "strength" in workout_goals:
                score += 30
        elif "giảm cân" in user_goal:
            if "cardio" in workout_goals or "tim mạch" in workout_goals:
                score += 30
        
        # Muscle group matching (use PrimaryMuscles if available)
        primary_muscles = (getattr(workout, 'PrimaryMuscles', '') or "").lower()
        if primary_muscles:
            # Bonus for targeting specific muscle groups
            score += 10
        
        # Difficulty matching (avoid too hard workouts for beginners)
        difficulty = (getattr(workout, 'Difficulty', '') or "").lower()
        if difficulty == "advanced" and not self.liked_workouts:
            # New user, reduce score for advanced workouts
            score -= 20
        elif difficulty == "beginner" and len(self.liked_workouts) > 10:
            # Experienced user, reduce score for beginner workouts
            score -= 10
        
        # Prerequisites check
        prerequisites = (getattr(workout, 'Prerequisites', '') or "").lower()
        if prerequisites and not self.liked_workouts:
            # New user with prerequisites required, slight penalty
            score -= 5
        
        score += random.randint(-5, 5)
        return score

    def _score_meal(self, meal, time_slot):
        if meal.Id in self.disliked_meals:
            return -1000
        
        # Check ingredients
        if meal.Ingredients:
            ingredients = set(i.strip().lower() for i in meal.Ingredients.split(','))
            for forbidden in self.forbidden_ingredients:
                for ing in ingredients:
                    if forbidden in ing:
                        return -1000

        score = 50
        
        if meal.Id in self.liked_meals:
            score += 50
        
        # Sport matching
        user_sport = (self.user.Sport or "").lower()
        if meal.SuitableSports and user_sport:
            suitable_sports = set(s.strip().lower() for s in meal.SuitableSports.split(','))
            sport_match = False
            for s in suitable_sports:
                if user_sport in s or s in user_sport:
                    sport_match = True
                    break
            if sport_match:
                score += 20

        # Goals logic
        user_goal = (self.user.Goal or "").lower()
        kcal = meal.Kcal or 0
        protein = meal.Protein or 0
        
        if "giảm cân" in user_goal:
            if kcal < 500 and protein > 20:
                score += 30
            elif kcal < 400:
                score += 20
        elif "tăng cơ" in user_goal:
            if protein > 25:
                score += 30
            elif protein > 15:
                score += 15

        score += random.randint(-10, 10)
        return score

    def _get_user_profile_hash(self):
        busy_slots = self._get_busy_slots()
        busy_str = ",".join(sorted(list(busy_slots)))
        profile_str = f"{self.user.Sport}_{self.user.Goal}_{self.user.Allergies}_{self.user.DislikedIngredients}_{busy_str}"
        return hashlib.md5(profile_str.encode()).hexdigest()
    
    def _has_profile_changed(self):
        existing_items = UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).all()
        
        if not existing_items:
            return False
        
        # Kiểm tra xem có tất cả items đã completed không
        completed_items = [item for item in existing_items if hasattr(item, 'IsCompleted') and item.IsCompleted]
        all_completed = len(completed_items) > 0 and len(completed_items) == len(existing_items)
        
        # Nếu tất cả items đã completed, không regenerate dù profile hash thay đổi
        if all_completed:
            print(f"✅ [ALL COMPLETED] All {len(existing_items)} items completed for {self.date_str}, keeping existing schedule")
            return False
            
        current_hash = self._get_user_profile_hash()
        saved_hash = existing_items[0].ProfileHash if hasattr(existing_items[0], 'ProfileHash') else None
        
        # Nếu hash thay đổi, chỉ regenerate nếu có items chưa completed
        # Nếu tất cả items đã completed, giữ nguyên lịch
        if saved_hash and saved_hash != current_hash:
            # Kiểm tra lại xem có items nào chưa completed không
            incomplete_items = [item for item in existing_items if not (hasattr(item, 'IsCompleted') and item.IsCompleted)]
            if len(incomplete_items) == 0:
                print(f"✅ [PROFILE CHANGED BUT ALL COMPLETED] Profile changed but all items completed, keeping schedule")
                return False
            print(f"🔄 [PROFILE CHANGED] User {self.user_id} profile changed, regenerating schedule (has {len(incomplete_items)} incomplete items)...")
            return True
        return False
    
    def _load_existing_schedule(self):
        if self._has_profile_changed():
            print("   ⚠️ Profile changed, will regenerate schedule")
            return None
        
        items = UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).all()
        
        if not items:
            return None
        
        busy_slots = self._get_busy_slots()
        schedule = []
        time_map = {
            "morning": "07:00 - 08:00",
            "afternoon": "12:00 - 13:00",
            "evening": "19:00 - 20:00"
        }
        
        # Không filter out items nếu đã completed - giữ nguyên lịch đã hoàn thành
        for item in items:
            # Nếu item đã completed, luôn hiển thị dù có busy hay không
            if item.IsCompleted:
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
                continue
            
            # Chỉ filter out items chưa completed nếu slot bận
            if item.Slot and item.Slot.lower() in busy_slots:
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
        
        if not schedule:
            return None
        
        return {
            "date": self.date_str,
            "user_id": self.user_id,
            "schedule": schedule
        }

    def _save_schedule(self, schedule_items):
        # Lấy các UserPlan cũ để preserve IsCompleted
        existing_plans = UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).all()
        
        # Tạo map để lưu IsCompleted theo (Type, Slot, MealId/WorkoutId)
        completed_map = {}
        for plan in existing_plans:
            key = (plan.Type, plan.Slot, plan.MealId if plan.Type == "meal" else plan.WorkoutId)
            if plan.IsCompleted:
                completed_map[key] = True
        
        # Xóa các plan cũ
        UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).delete()
        
        profile_hash = self._get_user_profile_hash()
        
        for item in schedule_items:
            if item["type"] == "meal":
                time_slot = None
                if "07:00" in item["time"]: time_slot = "morning"
                elif "12:00" in item["time"]: time_slot = "afternoon"
                elif "19:00" in item["time"]: time_slot = "evening"
                    
                if time_slot:
                    meal_id = item["data"]["Id"]
                    key = ("meal", time_slot, meal_id)
                    is_completed = completed_map.get(key, False)
                    
                    new_item = UserPlan(
                        UserId=self.user_id,
                        Date=self.date_obj,
                        Slot=time_slot,
                        Type="meal",
                        MealId=meal_id,
                        ProfileHash=profile_hash,
                        IsCompleted=is_completed
                    )
                    db.session.add(new_item)
                    
            elif item["type"] == "workout":
                time_slot = item["time"].replace("_slot", "")
                workout_id = item["data"]["Id"]
                key = ("workout", time_slot, workout_id)
                is_completed = completed_map.get(key, False)
                
                new_item = UserPlan(
                    UserId=self.user_id,
                    Date=self.date_obj,
                    Slot=time_slot,
                    Type="workout",
                    WorkoutId=workout_id,
                    ProfileHash=profile_hash,
                    IsCompleted=is_completed
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
        
        # --- WORKOUT GENERATION (Keep existing logic but stricter sport) ---
        print(f"💪 [WORKOUT] Checking workout slots...")
        
        workout_slots = []
        if "morning" not in busy_slots: workout_slots.append("morning")
        else: print(f"   ⏭️ Skipped morning (busy)")
        
        if "evening" not in busy_slots: workout_slots.append("evening")
        else: print(f"   ⏭️ Skipped evening (busy)")
        
        if len(workout_slots) < 2 and "afternoon" not in busy_slots:
            workout_slots.append("afternoon")
        
        all_workouts = Workout.query.filter_by(IsActive=True).all()
        user_sport = (self.user.Sport or "").lower()

        print(f"💪 [WORKOUT] Total active workouts in DB: {len(all_workouts)}")
        print(f"💪 [WORKOUT] User sport: {user_sport}")

        for slot in workout_slots:
            # Filter workouts - be more flexible
            candidates = []
            for w in all_workouts:
                w_aitags = (getattr(w, 'AITags', '') or "").lower()
                w_sport = (w.Sport or "").lower()
                
                # Match if:
                # 1. User sport in AITags
                # 2. User sport in Sport field
                # 3. Workout has "general" or "tất cả" tag
                # 4. No user sport set (show all)
                if not user_sport or \
                   user_sport in w_aitags or \
                   user_sport in w_sport or \
                   "general" in w_aitags or \
                   "tất cả" in w_aitags or \
                   "all" in w_aitags:
                    candidates.append(w)
            
            print(f"   🔍 Found {len(candidates)} candidate workouts for {slot}")
            
            # Use scoring to pick best from candidates
            pool = candidates if candidates else all_workouts
            
            if not pool:
                print(f"   ⚠️ No workouts available at all!")
                continue
                
            scored_workouts = [(w, self._score_workout(w, slot)) for w in pool]
            scored_workouts.sort(key=lambda x: x[1], reverse=True)
            
            top_workouts = scored_workouts[:5]
            if top_workouts:
                selected_workout = random.choice(top_workouts)[0]
                schedule.append({
                    "time": f"{slot}_slot",
                    "type": "workout",
                    "data": self._serialize_workout(selected_workout)
                })
                print(f"   ✅ Added {slot} workout: {selected_workout.Name} (score: {top_workouts[0][1]})")
            else:
                print(f"   ❌ No workout selected for {slot}")


        # --- MEAL GENERATION (STRICT MODE) ---
        periods = ["morning", "afternoon", "evening"]
        time_map = {
            "morning": "07:00 - 08:00",
            "afternoon": "12:00 - 13:00",
            "evening": "19:00 - 20:00"
        }
        
        # Define strict keywords for each period
        time_keywords = {
            "morning": ["bữa sáng", "trước tập", "breakfast", "morning"],
            "afternoon": ["bữa trưa", "lunch", "afternoon"],
            "evening": ["bữa tối", "sau tập", "dinner", "evening"]
        }

        all_meals = Meal.query.all()
        
        print(f"🍽️ [MEAL] Total meals in DB: {len(all_meals)}")

        for period in periods:
            if period in busy_slots:
                print(f"   ⏭️ Skipped meal {period} (busy)")
                continue
            
            print(f"   🍽️ Finding meal for {period}...")
            
            # 1. Try strict time filtering first
            time_candidates = []
            for m in all_meals:
                meal_time = (m.MealTime or "").lower()
                # Check if ANY keyword for this period appears in meal_time
                if any(kw in meal_time for kw in time_keywords[period]):
                    time_candidates.append(m)
            
            print(f"      - Time candidates: {len(time_candidates)}")
            
            # 2. If no time match, use all meals as fallback
            if not time_candidates:
                print(f"      ⚠️ No strict time match, using all meals")
                time_candidates = all_meals
            
            # 3. Try sport filtering (from time_candidates)
            sport_candidates = []
            if user_sport:
                for m in time_candidates:
                    m_sports = (m.SuitableSports or "").lower()
                    if user_sport in m_sports or "tất cả" in m_sports or "all" in m_sports:
                        sport_candidates.append(m)
            else:
                sport_candidates = time_candidates # No user sport, use all time candidates
            
            print(f"      - Sport candidates: {len(sport_candidates)}")
            
            # 4. If no sport match, fallback to time candidates
            final_pool = sport_candidates if sport_candidates else time_candidates
            
            if not final_pool:
                print(f"      ❌ No meals available for {period}, skipping")
                continue

            # 3. Score & Pick (Score now just adds refined preference like goal/ingredients)
            scored_meals = []
            for m in final_pool:
                s = self._score_meal(m, period)
                if s > -500: # Filter out forbidden ingredients (scored -1000)
                    scored_meals.append((m, s))
            
            scored_meals.sort(key=lambda x: x[1], reverse=True)
            top_choices = scored_meals[:5] # Pick from top 5 best matches
            
            if top_choices:
                chosen_meal = random.choice(top_choices)[0]
                
                meal_data = self._serialize_meal(chosen_meal)
                meal_data["MealType"] = period
                
                schedule.append({
                    "time": time_map[period],
                    "type": "meal",
                    "data": meal_data
                })
                print(f"   ✅ Added {period} meal: {chosen_meal.Name}")

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
            "ServingSize": getattr(m, 'ServingSize', ''),
            "SuitableSports": getattr(m, 'SuitableSports', ''),
            "MealTime": getattr(m, 'MealTime', ''),
            "Ingredients": getattr(m, 'Ingredients', ''),
            "Recipe": getattr(m, 'Recipe', ''),
            "Difficulty": getattr(m, 'Difficulty', ''),
            "CookingTimeMin": getattr(m, 'CookingTimeMin', 0),
            "VideoUrl": getattr(m, 'VideoUrl', None),
            "Image": getattr(m, 'Image', None)
        }

    def _serialize_workout(self, w):
        """Serialize workout with new 26-column structure"""
        return {
            # Core Info
            "Id": w.Id,
            "Name": w.Name,
            "Sport": w.Sport,
            "Intensity": w.Intensity,
            "Duration_min": w.Duration_min,
            "VideoUrl": getattr(w, 'VideoUrl', None),
            "Difficulty": getattr(w, 'Difficulty', ''),
            "CalorieBurn": getattr(w, 'CalorieBurn', None),
            
            # Workout Details
            "Sets": getattr(w, 'Sets', ''),
            "Reps": getattr(w, 'Reps', ''),
            "RestTime": getattr(w, 'RestTime', None),
            
            # Descriptions
            "Description": getattr(w, 'Description', ''),
            "Instructions": getattr(w, 'Instructions', ''),
            "SafetyNotes": getattr(w, 'SafetyNotes', ''),
            
            # Muscles
            "PrimaryMuscles": getattr(w, 'PrimaryMuscles', ''),
            "SecondaryMuscles": getattr(w, 'SecondaryMuscles', ''),
            "MuscleGroups": getattr(w, 'MuscleGroups', ''),
            
            # Equipment
            "Equipment": getattr(w, 'Equipment', ''),
            
            # Progression
            "ProgressionNotes": getattr(w, 'ProgressionNotes', ''),
            "RegressionNotes": getattr(w, 'RegressionNotes', ''),
            
            # Prerequisites
            "Prerequisites": getattr(w, 'Prerequisites', ''),
            
            # AI & Goals
            "AITags": getattr(w, 'AITags', ''),
            "Goals": getattr(w, 'Goals', '') or getattr(w, 'GoalFocus', ''),
        }



def build_daily_schedule(user_id, date_str):
    engine = SmartRecommendationEngine(user_id, date_str)
    return engine.generate_plan()

from db import db
from models import Meal, Workout, UserSchedule, User, Log, UserPlan
from datetime import datetime
import random
import json
import hashlib
import re

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
            # Chỉ tính là busy nếu có Period và có Note (không rỗng)
            if s.Period:
                period_lower = s.Period.lower().strip()
                normalized_period = period_map.get(period_lower, period_lower)
                
                # Kiểm tra Note: chỉ busy nếu có Note và Note không rỗng
                if s.Note and isinstance(s.Note, str) and s.Note.strip():
                    busy.add(normalized_period)
                    print(f"   ⛔ Busy slot: {s.Period} ({normalized_period}) - '{s.Note}'")
                else:
                    print(f"   ℹ️ Slot {s.Period} ({normalized_period}) has no note, NOT marked as busy")
        
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
        
        # ========== GOAL MATCHING - QUAN TRỌNG NHẤT ==========
        user_goal = (self.user.Goal or "").lower()
        workout_goals = (getattr(workout, 'Goals', '') or getattr(workout, 'GoalFocus', '') or "").lower()
        workout_name = (workout.Name or "").lower()
        workout_aitags_lower = workout_aitags
        intensity = (getattr(workout, 'Intensity', '') or "").lower()
        calorie_burn = getattr(workout, 'CalorieBurn', 0) or 0
        
        goal_score = 0
        goal_penalty = 0
        
        # Giảm cân: Ưu tiên cardio, HIIT, chạy bộ, bài tập đốt nhiều calo
        if "giảm cân" in user_goal or "weight loss" in user_goal or "giảm mỡ" in user_goal:
            # Positive signals (cộng điểm)
            if any(keyword in workout_goals + " " + workout_name + " " + workout_aitags_lower 
                   for keyword in ["cardio", "tim mạch", "hiit", "chạy", "running", "aerobic", "đốt cháy", "calorie burn"]):
                goal_score += 100  # Rất quan trọng!
            elif intensity in ["rất cao", "very high", "cao", "high"]:
                goal_score += 60
            elif calorie_burn > 300:  # Đốt nhiều calo
                goal_score += 40
            
            # Negative signals (trừ điểm nặng)
            if any(keyword in workout_goals + " " + workout_name + " " + workout_aitags_lower 
                   for keyword in ["sức mạnh", "strength", "tăng cơ", "muscle gain", "bulk", "tạ"]):
                goal_penalty -= 80  # Trừ điểm nặng cho strength training khi goal là giảm cân
            elif calorie_burn < 100 and intensity in ["thấp", "low", "nhẹ"]:
                goal_penalty -= 50  # Trừ điểm cho bài tập ít đốt calo
        
        # Tăng cân/Tăng cơ: Ưu tiên strength training, resistance, tạ
        elif "tăng cơ" in user_goal or "tăng cân" in user_goal or "muscle gain" in user_goal or "bulk" in user_goal:
            # Positive signals
            if any(keyword in workout_goals + " " + workout_name + " " + workout_aitags_lower 
                   for keyword in ["sức mạnh", "strength", "resistance", "tăng cơ", "muscle", "tạ", "weight", "gym"]):
                goal_score += 100  # Rất quan trọng!
            elif intensity in ["rất cao", "very high", "cao", "high"]:
                goal_score += 50
            elif "sets" in workout_name or "reps" in workout_name.lower():
                goal_score += 30  # Có sets/reps thường là strength training
            
            # Negative signals
            if any(keyword in workout_goals + " " + workout_name + " " + workout_aitags_lower 
                   for keyword in ["cardio", "tim mạch", "chạy", "running", "aerobic"]):
                goal_penalty -= 60  # Trừ điểm cho cardio khi goal là tăng cơ
            elif calorie_burn > 400 and "cardio" in workout_name:
                goal_penalty -= 40
        
        # Duy trì: Cân bằng giữa cardio và strength
        elif "duy trì" in user_goal or "maintain" in user_goal or "cân bằng" in user_goal:
            # Ưu tiên bài tập cân bằng
            if any(keyword in workout_goals + " " + workout_aitags_lower 
                   for keyword in ["general", "tất cả", "balanced", "all-around", "full body"]):
                goal_score += 80
            elif intensity in ["trung bình", "medium", "moderate"]:
                goal_score += 40
            elif 150 <= calorie_burn <= 350:  # Đốt calo vừa phải
                goal_score += 30
            
            # Không quá nghiêng về một bên
            if (calorie_burn > 500 and "cardio" in workout_name) or \
               (any(keyword in workout_name for keyword in ["strength", "tạ"]) and calorie_burn < 50):
                goal_penalty -= 30
        
        score += goal_score + goal_penalty
        
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
        
        # Chỉ thêm random nhỏ để có chút đa dạng (giảm từ ±5 xuống ±3)
        score += random.randint(-3, 3)
        
        # Nếu workout hoàn toàn không phù hợp với goal, trả về điểm rất thấp
        if goal_penalty <= -70:
            return score - 200  # Điểm rất thấp, khó được chọn
        
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
        # Check cả None và False
        completed_items = [item for item in existing_items if getattr(item, 'IsCompleted', False) == True]
        all_completed = len(existing_items) > 0 and len(completed_items) == len(existing_items)
        
        # Nếu tất cả items đã completed, KHÔNG regenerate dù profile hash thay đổi
        # Chỉ update ProfileHash nếu cần, nhưng giữ nguyên items
        if all_completed:
            current_hash = self._get_user_profile_hash()
            saved_hash = existing_items[0].ProfileHash if hasattr(existing_items[0], 'ProfileHash') else None
            
            # Nếu hash thay đổi, chỉ update hash, không regenerate
            if saved_hash and saved_hash != current_hash:
                print(f"✅ [ALL COMPLETED + HASH CHANGED] All {len(existing_items)} items completed for {self.date_str}, updating hash only, keeping existing schedule")
                # Update hash cho tất cả items nhưng không regenerate
                for item in existing_items:
                    item.ProfileHash = current_hash
                db.session.commit()
            
            return False
        
        # Kiểm tra xem có items nào có ProfileHash = None không (đã bị invalidate)
        # Nếu có items bị invalidate, đã được xử lý ở _load_existing_schedule, không cần check lại ở đây
        invalidated_items = [item for item in existing_items if not item.ProfileHash and not (hasattr(item, 'IsCompleted') and item.IsCompleted)]
        if invalidated_items:
            # Đã được xử lý ở _load_existing_schedule, không cần regenerate lại
            return False
            
        current_hash = self._get_user_profile_hash()
        saved_hash = existing_items[0].ProfileHash if hasattr(existing_items[0], 'ProfileHash') else None
        
        # Nếu hash thay đổi, chỉ regenerate nếu có items chưa completed
        if saved_hash and saved_hash != current_hash:
            incomplete_items = [item for item in existing_items if not (hasattr(item, 'IsCompleted') and item.IsCompleted)]
            if len(incomplete_items) == 0:
                print(f"✅ [PROFILE CHANGED BUT ALL COMPLETED] Profile changed but all items completed, keeping schedule")
                return False
            print(f"🔄 [PROFILE CHANGED] User {self.user_id} profile changed, regenerating schedule (has {len(incomplete_items)} incomplete items)...")
            return True
        
        # Nếu hash khớp và không có items bị invalidate, giữ nguyên schedule
        print(f"✅ [PROFILE UNCHANGED] Profile hash matches, keeping existing schedule")
        return False
    
    def _load_existing_schedule(self):
        items = UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).all()
        
        # Nếu không có items, regenerate
        if not items:
            print("   ⚠️ No existing schedule, will generate new")
            return None
        
        # Đơn giản: chỉ check profile changed, không check invalidate phức tạp
        if self._has_profile_changed():
            print("   ⚠️ Profile changed, will regenerate schedule")
            return None
        
        busy_slots = self._get_busy_slots()
        print(f"   📋 [LOAD EXISTING] Found {len(items)} items for {self.date_str}, busy_slots: {busy_slots}")
        
        schedule = []
        time_map = {
            "morning": "07:00 - 08:00",
            "afternoon": "12:00 - 13:00",
            "evening": "19:00 - 20:00"
        }
        
        # Normalize slot mapping
        slot_normalize = {
            "sáng": "morning", "buổi sáng": "morning",
            "trưa": "afternoon", "buổi trưa": "afternoon",
            "tối": "evening", "buổi tối": "evening"
        }
        
        # Track các slots đã có items (để check xem có thiếu không)
        filled_slots = {
            "morning": {"meal": False, "workout": False},
            "afternoon": {"meal": False, "workout": False},
            "evening": {"meal": False, "workout": False}
        }
        
        # Load tất cả items, filter out items ở busy slots (trừ completed)
        for item in items:
            is_completed = getattr(item, 'IsCompleted', False) == True
            item_slot = item.Slot.lower().strip() if item.Slot else ""
            
            # Normalize slot
            normalized_slot = slot_normalize.get(item_slot, item_slot)
            if normalized_slot not in ["morning", "afternoon", "evening"]:
                normalized_slot = item_slot  # Giữ nguyên nếu không match
            
            is_busy = normalized_slot in busy_slots
            
            # Nếu item đã completed, luôn hiển thị
            if is_completed:
                if item.Type == "meal" and item.MealId:
                    meal = Meal.query.get(item.MealId)
                    if meal:
                        meal_data = self._serialize_meal(meal)
                        meal_data["MealType"] = item.Slot
                        schedule.append({
                            "time": time_map.get(normalized_slot, item.Slot),
                            "type": "meal",
                            "data": meal_data
                        })
                        if normalized_slot in filled_slots:
                            filled_slots[normalized_slot]["meal"] = True
                elif item.Type == "workout" and item.WorkoutId:
                    workout = Workout.query.get(item.WorkoutId)
                    if workout:
                        schedule.append({
                            "time": f"{normalized_slot}_slot",
                            "type": "workout",
                            "data": self._serialize_workout(workout)
                        })
                        if normalized_slot in filled_slots:
                            filled_slots[normalized_slot]["workout"] = True
                continue
            
            # Filter out items chưa completed ở busy slots
            if is_busy:
                continue
            
            # Thêm items không busy
            if item.Type == "meal" and item.MealId:
                meal = Meal.query.get(item.MealId)
                if meal:
                    meal_data = self._serialize_meal(meal)
                    meal_data["MealType"] = item.Slot
                    schedule.append({
                        "time": time_map.get(normalized_slot, item.Slot),
                        "type": "meal",
                        "data": meal_data
                    })
                    if normalized_slot in filled_slots:
                        filled_slots[normalized_slot]["meal"] = True
            elif item.Type == "workout" and item.WorkoutId:
                workout = Workout.query.get(item.WorkoutId)
                if workout:
                    schedule.append({
                        "time": f"{normalized_slot}_slot",
                        "type": "workout",
                        "data": self._serialize_workout(workout)
                    })
                    if normalized_slot in filled_slots:
                        filled_slots[normalized_slot]["workout"] = True
        
        # QUAN TRỌNG: Kiểm tra xem có thiếu items cho slots không busy không
        # Nếu thiếu, return None để trigger regenerate
        missing_items = []
        for slot in ["morning", "afternoon", "evening"]:
            if slot not in busy_slots:
                # Slot không busy, phải có meal
                if not filled_slots[slot]["meal"]:
                    missing_items.append(f"{slot} meal")
                # Morning và evening phải có workout (afternoon optional)
                if slot in ["morning", "evening"] and not filled_slots[slot]["workout"]:
                    missing_items.append(f"{slot} workout")
        
        if missing_items:
            print(f"   ⚠️ Missing items for non-busy slots: {missing_items}, will regenerate")
            return None
        
        if not schedule:
            return None
        
        return {
            "date": self.date_str,
            "user_id": self.user_id,
            "schedule": schedule
        }

    def _save_schedule(self, schedule_items):
        # Đơn giản: Lấy các UserPlan cũ để preserve IsCompleted
        existing_plans = UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).all()
        
        # Tạo map để lưu IsCompleted
        completed_map = {}
        for plan in existing_plans:
            key = (plan.Type, plan.Slot, plan.MealId if plan.Type == "meal" else plan.WorkoutId)
            if plan.IsCompleted:
                completed_map[key] = True
        
        profile_hash = self._get_user_profile_hash()
        
        # Tạo set các items mới
        new_items_set = set()
        for item in schedule_items:
            if item["type"] == "meal":
                time_slot = None
                if "07:00" in item["time"]: time_slot = "morning"
                elif "12:00" in item["time"]: time_slot = "afternoon"
                elif "19:00" in item["time"]: time_slot = "evening"
                if time_slot:
                    meal_id = item["data"]["Id"]
                    new_items_set.add(("meal", time_slot, meal_id))
            elif item["type"] == "workout":
                time_slot = item["time"].replace("_slot", "")
                workout_id = item["data"]["Id"]
                new_items_set.add(("workout", time_slot, workout_id))
        
        # Kiểm tra busy slots
        current_busy_slots = self._get_busy_slots()
        
        # Đơn giản: Xóa items cũ CHƯA completed và không còn trong schedule mới
        # Giữ nguyên completed items
        for plan in existing_plans:
            key = (plan.Type, plan.Slot, plan.MealId if plan.Type == "meal" else plan.WorkoutId)
            is_completed = getattr(plan, 'IsCompleted', False) == True
            plan_slot = plan.Slot.lower() if plan.Slot else ""
            is_now_busy = plan_slot in current_busy_slots
            
            # Giữ nguyên completed items
            if is_completed:
                plan.ProfileHash = profile_hash
                continue
            
            # Xóa nếu busy hoặc không còn trong schedule mới
            if is_now_busy or key not in new_items_set:
                db.session.delete(plan)
        
        for item in schedule_items:
            if item["type"] == "meal":
                time_slot = None
                if "07:00" in item["time"]: time_slot = "morning"
                elif "12:00" in item["time"]: time_slot = "afternoon"
                elif "19:00" in item["time"]: time_slot = "evening"
                    
                if time_slot:
                    meal_id = item["data"]["Id"]
                    key = ("meal", time_slot, meal_id)
                    
                    # Kiểm tra xem item này đã tồn tại chưa
                    existing = UserPlan.query.filter_by(
                        UserId=self.user_id,
                        Date=self.date_obj,
                        Slot=time_slot,
                        Type="meal",
                        MealId=meal_id
                    ).first()
                    
                    if not existing:
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
                    else:
                        # Item đã tồn tại, chỉ update hash
                        existing.ProfileHash = profile_hash
                    
            elif item["type"] == "workout":
                time_slot = item["time"].replace("_slot", "")
                workout_id = item["data"]["Id"]
                key = ("workout", time_slot, workout_id)
                
                # Kiểm tra xem item này đã tồn tại chưa
                existing = UserPlan.query.filter_by(
                    UserId=self.user_id,
                    Date=self.date_obj,
                    Slot=time_slot,
                    Type="workout",
                    WorkoutId=workout_id
                ).first()
                
                if not existing:
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
                else:
                    # Item đã tồn tại, chỉ update hash
                    existing.ProfileHash = profile_hash
        
        db.session.commit()

    def generate_plan(self):
        # Check xem tất cả items đã completed chưa - nếu rồi thì KHÔNG regenerate
        existing_items = UserPlan.query.filter_by(
            UserId=self.user_id,
            Date=self.date_obj
        ).all()
        
        if existing_items:
            completed_items = [item for item in existing_items if getattr(item, 'IsCompleted', False) == True]
            all_completed = len(completed_items) == len(existing_items) and len(existing_items) > 0
            
            if all_completed:
                print(f"🚫 [GENERATE PLAN SKIP] All {len(existing_items)} items completed for {self.date_str}, skipping regeneration")
                # Vẫn return existing schedule
                existing = self._load_existing_schedule()
                if existing:
                    return existing
        
        existing = self._load_existing_schedule()
        if existing:
            return existing
        
        seed_val = int(hashlib.md5(f"{self.user_id}_{self.date_str}".encode()).hexdigest(), 16) % (2**32)
        random.seed(seed_val)

        busy_slots = self._get_busy_slots()
        schedule = []
        
        # --- WORKOUT GENERATION (Đơn giản: tạo cho tất cả slots không busy) ---
        print(f"💪 [WORKOUT] Checking workout slots...")
        print(f"   📋 Busy slots detected: {busy_slots}")
        
        workout_slots = []
        if "morning" not in busy_slots: 
            workout_slots.append("morning")
            print(f"   ✅ Morning slot available (not busy)")
        else: 
            print(f"   ⏭️ Skipped morning (busy)")
        
        if "evening" not in busy_slots: 
            workout_slots.append("evening")
            print(f"   ✅ Evening slot available (not busy)")
        else: 
            print(f"   ⏭️ Skipped evening (busy)")
        
        if len(workout_slots) < 2 and "afternoon" not in busy_slots:
            workout_slots.append("afternoon")
            print(f"   ✅ Afternoon slot added as backup")
        
        print(f"   📋 Selected workout slots to fill: {workout_slots}")
        
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
            
            # Lọc bỏ các workout có điểm quá thấp (không phù hợp với goal)
            valid_workouts = [(w, s) for w, s in scored_workouts if s > 0]
            
            if valid_workouts:
                # Ưu tiên chọn từ top 3 có điểm cao nhất (thay vì random từ top 5)
                # Điều này đảm bảo chọn workout phù hợp nhất với goal
                top_workouts = valid_workouts[:3]
                
                # Nếu top workout có điểm cao hơn đáng kể (>= 20 điểm), chọn nó luôn
                if len(top_workouts) > 1 and top_workouts[0][1] >= top_workouts[1][1] + 20:
                    selected_workout = top_workouts[0][0]
                    selected_score = top_workouts[0][1]
                    print(f"   ✅ Added {slot} workout (BEST MATCH): {selected_workout.Name} (score: {selected_score})")
                else:
                    # Nếu các workout có điểm gần nhau, chọn random từ top 3 để có đa dạng
                    selected_workout, selected_score = random.choice(top_workouts)
                    print(f"   ✅ Added {slot} workout (TOP 3): {selected_workout.Name} (score: {selected_score})")
                
                schedule.append({
                    "time": f"{slot}_slot",
                    "type": "workout",
                    "data": self._serialize_workout(selected_workout)
                })
            elif scored_workouts:
                # Fallback: use the highest scored workout even if score is low
                selected_workout = scored_workouts[0][0]
                selected_score = scored_workouts[0][1]
                schedule.append({
                    "time": f"{slot}_slot",
                    "type": "workout",
                    "data": self._serialize_workout(selected_workout)
                })
                print(f"   ⚠️ Added {slot} workout with fallback (low score): {selected_workout.Name} (score: {selected_score})")
            else:
                # Fallback cuối cùng: chọn workout bất kỳ nếu không có workout nào phù hợp
                # Đảm bảo luôn có workout cho slot không busy
                if pool:
                    selected_workout = pool[0]
                    print(f"   ⚠️ Using fallback workout for {slot}: {selected_workout.Name} (no suitable workout found)")
                    schedule.append({
                        "time": f"{slot}_slot",
                        "type": "workout",
                        "data": self._serialize_workout(selected_workout)
                    })
                else:
                    print(f"   ❌ ERROR: No workouts available at all for {slot}!")
                    print(f"   ❌ Pool size: {len(pool)}, scored workouts: {len(scored_workouts)}")


        # --- MEAL GENERATION (Đơn giản: tạo cho tất cả slots không busy) ---
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
                print(f"      ⚠️ No meals available for {period}, using all meals as last resort")
                # Fallback cuối cùng: dùng tất cả meals nếu không có meal nào phù hợp
                final_pool = all_meals
                if not final_pool:
                    print(f"      ❌ ERROR: No meals in database at all!")
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
            else:
                # Fallback: chọn meal bất kỳ nếu không có meal nào phù hợp
                # Đảm bảo luôn có meal cho slot không busy
                if final_pool:
                    chosen_meal = random.choice(final_pool)
                    meal_data = self._serialize_meal(chosen_meal)
                    meal_data["MealType"] = period
                    
                    schedule.append({
                        "time": time_map[period],
                        "type": "meal",
                        "data": meal_data
                    })
                    print(f"   ⚠️ Added {period} meal with fallback: {chosen_meal.Name} (no suitable meal found)")
                else:
                    print(f"   ❌ ERROR: No meals available for {period}!")

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
        # Clean Sets/Reps - remove empty strings, '0', or 0 values
        sets = getattr(w, 'Sets', '') or ''
        if sets == '0' or sets == 0:
            sets = ''
        elif isinstance(sets, str):
            sets = sets.strip()
        
        reps = getattr(w, 'Reps', '') or ''
        if reps == '0' or reps == 0:
            reps = ''
        elif isinstance(reps, str):
            # Remove trailing " 0" from reps string if exists (e.g., "20 phút 0" -> "20 phút")
            reps = re.sub(r'\s+0\s*$', '', reps.strip()).strip()
        
        rest_time = getattr(w, 'RestTime', None)
        if rest_time == 0:
            rest_time = None
        
        return {
            # Core Info
            "Id": w.Id,
            "Name": w.Name,
            "Sport": w.Sport,
            "Intensity": w.Intensity,
            "Duration_min": w.Duration_min,
            "VideoUrl": getattr(w, 'VideoUrl', None),
            "Difficulty": getattr(w, 'Difficulty', ''),
            "CalorieBurn": getattr(w, 'CalorieBurn', None) if getattr(w, 'CalorieBurn', None) and getattr(w, 'CalorieBurn', None) > 0 else None,
            
            # Workout Details
            "Sets": sets,
            "Reps": reps,
            "RestTime": rest_time,
            
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

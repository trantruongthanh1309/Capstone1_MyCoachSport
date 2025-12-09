# 🚀 QUICK REFERENCE - WORKOUTS API

## 📊 DATABASE STRUCTURE (26 COLUMNS):

```sql
-- Core Info (11)
Id, Name, Sport, Duration_min, MuscleGroups, Intensity, Equipment, 
Difficulty, GoalFocus, CalorieBurn, VideoUrl

-- Workout Details (3)
Sets, Reps, RestTime

-- Descriptions (3)
Description, Instructions, SafetyNotes

-- AI & Goals (2)
AITags, Goals

-- Metadata (3)
CreatedAt, UpdatedAt, IsActive

-- Progression (2)
ProgressionNotes, RegressionNotes

-- Muscles (2)
PrimaryMuscles, SecondaryMuscles

-- Prerequisites (1)
Prerequisites
```

---

## 🔌 ADMIN API ENDPOINTS:

### **GET /api/admin/workouts**
List workouts với pagination và filters
```javascript
// Query params:
page=1
per_page=20
search=squat
sport=gym
difficulty=Beginner
is_active=true

// Response:
{
  success: true,
  data: [workout.to_admin_dict()],
  pagination: { page, per_page, total, pages }
}
```

### **GET /api/admin/workouts/:id**
Get single workout
```javascript
// Response:
{
  success: true,
  data: workout.to_admin_dict() // Includes DataCompleteness%
}
```

### **POST /api/admin/workouts**
Create new workout
```javascript
// Body (all 26 fields):
{
  name, sport, duration_min, muscle_groups, intensity, equipment,
  difficulty, goal_focus, calorie_burn, video_url,
  sets, reps, rest_time,
  description, instructions, safety_notes,
  ai_tags, goals,
  progression_notes, regression_notes,
  primary_muscles, secondary_muscles,
  prerequisites,
  is_active
}
```

### **PUT /api/admin/workouts/:id**
Update workout (partial update supported)
```javascript
// Body: any of the 26 fields
{ name: "New name", sets: "5", ... }
```

### **DELETE /api/admin/workouts/:id**
Soft delete (set IsActive = False)

### **DELETE /api/admin/workouts/:id/hard-delete**
Permanent delete

### **GET /api/admin/workouts/stats**
Get statistics
```javascript
// Response:
{
  total, active, inactive,
  by_difficulty: { beginner, intermediate, advanced },
  data_quality: {
    with_description,
    with_instructions,
    with_progression,
    completeness_rate
  }
}
```

### **GET /api/admin/workouts/filters/sports**
Get unique sports from database

### **GET /api/admin/workouts/filters/difficulties**
Get difficulty levels: ['Beginner', 'Intermediate', 'Advanced']

---

## 💡 PYTHON MODEL METHODS:

### **workout.to_dict()**
Full data (26 fields) - For API responses

### **workout.to_simple_dict()**
Simplified data - For schedule display
```python
{
  Id, Name, Sport, Intensity, Duration_min, VideoUrl,
  Description, Sets, Reps, RestTime, Equipment,
  Difficulty, CalorieBurn, PrimaryMuscles, SafetyNotes
}
```

### **workout.to_admin_dict()**
Admin data with extras
```python
{
  ...all 26 fields,
  TotalFields: 26,
  HasDescription: bool,
  HasInstructions: bool,
  HasProgression: bool,
  HasRegression: bool,
  DataCompleteness: 85.5  // percentage
}
```

---

## 🎯 AI RECOMMENDATION IMPROVEMENTS:

### **Scoring Factors (7 total):**
1. ✅ Liked workouts (+50)
2. ✅ Sport matching via AITags (+50) or general (+20)
3. ✅ Goal matching (+30)
4. ✅ Primary muscles bonus (+10)
5. ✅ Difficulty matching (-20 for advanced if beginner, -10 for beginner if experienced)
6. ✅ Prerequisites check (-5 if new user)
7. ✅ Random variation (±5)

### **Filtering:**
- Uses AITags + Sport (more flexible)
- Checks IsActive (only active workouts)
- Filters by user sport or "general"

---

## 📝 EXAMPLE DATA FORMAT:

```json
{
  "Id": 1,
  "Name": "Squat 4x12",
  "Sport": "gym",
  "Duration_min": 20,
  "MuscleGroups": "chân, mông",
  "Intensity": "trung bình",
  "Equipment": "thanh tạ, squat rack",
  "Difficulty": "Intermediate",
  "GoalFocus": "Sức mạnh",
  "CalorieBurn": 150,
  "VideoUrl": "https://...",
  
  "Sets": "4",
  "Reps": "12",
  "RestTime": 90,
  
  "Description": "Bài tập chân cơ bản...",
  "Instructions": "1. Đứng thẳng...\n2. Gập đầu gối...",
  "SafetyNotes": "⚠️ Giữ lưng thẳng...",
  
  "AITags": "strength,legs,compound,intermediate,gym",
  "Goals": "Sức mạnh, Tăng cơ",
  
  "CreatedAt": "2025-12-07T12:00:00",
  "UpdatedAt": "2025-12-07T12:00:00",
  "IsActive": true,
  
  "ProgressionNotes": "Tăng tạ 2.5-5kg mỗi tuần...",
  "RegressionNotes": "Goblet squat, Bodyweight squat...",
  
  "PrimaryMuscles": "Quadriceps, Glutes, Hamstrings",
  "SecondaryMuscles": "Core, Calves",
  
  "Prerequisites": "Đã biết squat cơ bản, Core đủ mạnh"
}
```

---

## ✅ QUICK CHECKLIST:

### **Khi thêm workout mới:**
- [ ] Name (required)
- [ ] Sport
- [ ] Sets, Reps, RestTime
- [ ] Description (ngắn gọn)
- [ ] Instructions (từng bước)
- [ ] SafetyNotes (lưu ý quan trọng)
- [ ] AITags (comma-separated: "strength,legs,gym")
- [ ] PrimaryMuscles
- [ ] Difficulty (Beginner/Intermediate/Advanced)
- [ ] ProgressionNotes (nếu có)
- [ ] Prerequisites (nếu cần)

### **Optional nhưng nên có:**
- [ ] VideoUrl
- [ ] RegressionNotes
- [ ] SecondaryMuscles
- [ ] Goals

---

**Backend đã sẵn sàng! Chờ data từ bạn! 🚀**

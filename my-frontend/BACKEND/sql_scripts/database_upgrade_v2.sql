USE MySportCoachAI;
GO

-- 1. Thêm cột cho Workouts
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Workouts') AND name = 'Difficulty')
    ALTER TABLE Workouts ADD Difficulty NVARCHAR(50);
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Workouts') AND name = 'GoalFocus')
    ALTER TABLE Workouts ADD GoalFocus NVARCHAR(100);
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Workouts') AND name = 'CalorieBurn')
    ALTER TABLE Workouts ADD CalorieBurn INT;
GO

-- 2. Thêm cột cho Meals
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Meals') AND name = 'MealTiming')
    ALTER TABLE Meals ADD MealTiming NVARCHAR(100);
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Meals') AND name = 'CookingTimeMin')
    ALTER TABLE Meals ADD CookingTimeMin INT;
GO

-- 3. Cập nhật dữ liệu Workouts
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Tốc độ', CalorieBurn = 250, SportTags = N'bóng đá,chạy bộ' WHERE Id = 1;
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Kỹ thuật', CalorieBurn = 150, SportTags = N'bóng đá' WHERE Id = 2;
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Sức bền', CalorieBurn = 200, SportTags = N'cầu lông,boxing,general' WHERE Id = 3;
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Sức bền', CalorieBurn = 350, SportTags = N'chạy bộ,bóng đá' WHERE Id = 4;
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Tốc độ', CalorieBurn = 400, SportTags = N'chạy bộ,bóng đá' WHERE Id = 5;
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Hồi phục', CalorieBurn = 120, SportTags = N'general,recovery' WHERE Id = 6;
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Sức mạnh', CalorieBurn = 100, SportTags = N'gym,general' WHERE Id = 7;
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Sức mạnh', CalorieBurn = 150, SportTags = N'gym,bóng đá' WHERE Id = 8;
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Cơ lõi', CalorieBurn = 80, SportTags = N'gym,general' WHERE Id = 9;
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Cơ lõi', CalorieBurn = 60, SportTags = N'gym,yoga' WHERE Id = 10;
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Sức bền', CalorieBurn = 300, SportTags = N'bơi lội' WHERE Id = 11;
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Kỹ thuật', CalorieBurn = 200, SportTags = N'bơi lội' WHERE Id = 12;
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Phản xạ', CalorieBurn = 280, SportTags = N'cầu lông' WHERE Id = 13;
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Kỹ thuật', CalorieBurn = 180, SportTags = N'cầu lông' WHERE Id = 14;
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Dẻo dai', CalorieBurn = 100, SportTags = N'yoga,recovery' WHERE Id = 15;
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Hồi phục', CalorieBurn = 80, SportTags = N'yoga,recovery' WHERE Id = 16;
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Tim mạch', CalorieBurn = 120, SportTags = N'general,warmup' WHERE Id = 17;
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Toàn thân', CalorieBurn = 150, SportTags = N'gym,general' WHERE Id = 18;
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Cơ lõi', CalorieBurn = 130, SportTags = N'gym,general' WHERE Id = 19;
GO

-- 4. Cập nhật dữ liệu Meals
UPDATE Meals SET MealTiming = N'Breakfast', CookingTimeMin = 10 WHERE Id IN (2, 3, 4, 5);
UPDATE Meals SET MealTiming = N'Breakfast,PreWorkout', CookingTimeMin = 5 WHERE Id = 3;
UPDATE Meals SET MealTiming = N'Lunch', CookingTimeMin = 30 WHERE Id IN (6, 7, 8, 9, 10);
UPDATE Meals SET MealTiming = N'Dinner', CookingTimeMin = 40 WHERE Id IN (11, 12, 13, 14, 15);
UPDATE Meals SET MealTiming = N'Snack,PostWorkout', CookingTimeMin = 0 WHERE Id = 16;
UPDATE Meals SET MealTiming = N'Snack,PreWorkout', CookingTimeMin = 0 WHERE Id = 17;
UPDATE Meals SET MealTiming = N'Snack', CookingTimeMin = 0 WHERE Id = 18;
UPDATE Meals SET MealTiming = N'PostWorkout', CookingTimeMin = 5 WHERE Id = 19;
GO

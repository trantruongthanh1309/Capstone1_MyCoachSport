USE MySportCoachAI;
GO

-- =============================================
-- 1. NÂNG CẤP BẢNG WORKOUTS (BÀI TẬP)
-- =============================================

-- Thêm cột Difficulty (Độ khó) nếu chưa có
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Workouts') AND name = 'Difficulty')
    ALTER TABLE Workouts ADD Difficulty NVARCHAR(50);

-- Thêm cột GoalFocus (Mục tiêu chính: Tốc độ, Sức bền, Sức mạnh...)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Workouts') AND name = 'GoalFocus')
    ALTER TABLE Workouts ADD GoalFocus NVARCHAR(100);

-- Thêm cột CalorieBurn (Ước tính calo tiêu thụ trong thời gian tập)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Workouts') AND name = 'CalorieBurn')
    ALTER TABLE Workouts ADD CalorieBurn INT;

-- CẬP NHẬT DỮ LIỆU CHI TIẾT CHO WORKOUTS (Dựa trên ID trong ảnh)
-- ID 1: Chạy nước rút (Bóng đá - Tốc độ - Cao)
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Tốc độ', CalorieBurn = 250, SportTags = N'bóng đá,chạy bộ' WHERE Id = 1;
-- ID 2: Đá bóng tại chỗ (Bóng đá - Kỹ thuật - TB)
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Kỹ thuật', CalorieBurn = 150, SportTags = N'bóng đá' WHERE Id = 2;
-- ID 3: Nhảy dây (Cầu lông/General - Tim mạch - Cao)
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Sức bền', CalorieBurn = 200, SportTags = N'cầu lông,boxing,general' WHERE Id = 3;
-- ID 4: Chạy bộ 5km (Chạy bộ - Sức bền - Cao)
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Sức bền', CalorieBurn = 350, SportTags = N'chạy bộ,bóng đá' WHERE Id = 4;
-- ID 5: Chạy interval (Chạy bộ - Tốc độ - Rất cao)
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Tốc độ', CalorieBurn = 400, SportTags = N'chạy bộ,bóng đá' WHERE Id = 5;
-- ID 6: Đi bộ nhanh (Hồi phục - Thấp)
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Hồi phục', CalorieBurn = 120, SportTags = N'general,recovery' WHERE Id = 6;
-- ID 7: Hít đất (Gym - Sức mạnh - TB)
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Sức mạnh', CalorieBurn = 100, SportTags = N'gym,general' WHERE Id = 7;
-- ID 8: Squat (Gym - Chân mông - TB)
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Sức mạnh', CalorieBurn = 150, SportTags = N'gym,bóng đá' WHERE Id = 8;
-- ID 9: Gập bụng (Core - Thấp)
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Cơ lõi', CalorieBurn = 80, SportTags = N'gym,general' WHERE Id = 9;
-- ID 10: Plank (Core - TB)
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Cơ lõi', CalorieBurn = 60, SportTags = N'gym,yoga' WHERE Id = 10;
-- ID 11: Bơi sải (Bơi - Toàn thân - Cao)
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Sức bền', CalorieBurn = 300, SportTags = N'bơi lội' WHERE Id = 11;
-- ID 12: Bơi ếch (Bơi - Kỹ thuật - TB)
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Kỹ thuật', CalorieBurn = 200, SportTags = N'bơi lội' WHERE Id = 12;
-- ID 13: Đánh cầu lông (Cầu lông - Phản xạ - Cao)
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Phản xạ', CalorieBurn = 280, SportTags = N'cầu lông' WHERE Id = 13;
-- ID 14: Phản xạ cầu lông (Cầu lông - Kỹ thuật - TB)
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Kỹ thuật', CalorieBurn = 180, SportTags = N'cầu lông' WHERE Id = 14;
-- ID 15: Yoga cơ bản (Yoga - Dẻo dai - Thấp)
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Dẻo dai', CalorieBurn = 100, SportTags = N'yoga,recovery' WHERE Id = 15;
-- ID 16: Yoga phục hồi (Yoga - Hồi phục - Thấp)
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Hồi phục', CalorieBurn = 80, SportTags = N'yoga,recovery' WHERE Id = 16;
-- ID 17: Jumping jack (Cardio - TB)
UPDATE Workouts SET Difficulty = N'Beginner', GoalFocus = N'Tim mạch', CalorieBurn = 120, SportTags = N'general,warmup' WHERE Id = 17;
-- ID 18: Burpee (Cardio - Cao)
UPDATE Workouts SET Difficulty = N'Advanced', GoalFocus = N'Toàn thân', CalorieBurn = 150, SportTags = N'gym,general' WHERE Id = 18;
-- ID 19: Leo núi tại chỗ (Core - TB)
UPDATE Workouts SET Difficulty = N'Intermediate', GoalFocus = N'Cơ lõi', CalorieBurn = 130, SportTags = N'gym,general' WHERE Id = 19;

-- =============================================
-- 2. NÂNG CẤP BẢNG MEALS (MÓN ĂN)
-- =============================================

-- Thêm cột MealTiming (Thời điểm ăn: Sáng, Trưa, Tối, Trước tập, Sau tập, Ăn vặt)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Meals') AND name = 'MealTiming')
    ALTER TABLE Meals ADD MealTiming NVARCHAR(100);

-- Thêm cột CookingTimeMin (Thời gian nấu - phút)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Meals') AND name = 'CookingTimeMin')
    ALTER TABLE Meals ADD CookingTimeMin INT;

-- CẬP NHẬT DỮ LIỆU CHI TIẾT CHO MEALS
-- Bữa sáng
UPDATE Meals SET MealTiming = N'Breakfast', CookingTimeMin = 10 WHERE Id IN (2, 3, 4, 5); -- Bánh mì, Cháo, Phở gà, Bún riêu
UPDATE Meals SET MealTiming = N'Breakfast,PreWorkout', CookingTimeMin = 5 WHERE Id = 3; -- Cháo yến mạch (tốt cho trước tập)

-- Bữa trưa
UPDATE Meals SET MealTiming = N'Lunch', CookingTimeMin = 30 WHERE Id IN (6, 7, 8, 9, 10); -- Cơm gà, Bún chả, Phở bò, Cơm cá hồi, Bún bò

-- Bữa tối
UPDATE Meals SET MealTiming = N'Dinner', CookingTimeMin = 40 WHERE Id IN (11, 12, 13, 14, 15); -- Cơm thịt kho, Cá kho, Rau luộc, Cơm tấm, Lẩu

-- Ăn vặt / Bổ sung
UPDATE Meals SET MealTiming = N'Snack,PostWorkout', CookingTimeMin = 0 WHERE Id = 16; -- Sữa chua Hy Lạp (Protein cao)
UPDATE Meals SET MealTiming = N'Snack,PreWorkout', CookingTimeMin = 0 WHERE Id = 17; -- Chuối (Năng lượng nhanh)
UPDATE Meals SET MealTiming = N'Snack', CookingTimeMin = 0 WHERE Id = 18; -- Hạt điều
UPDATE Meals SET MealTiming = N'PostWorkout', CookingTimeMin = 5 WHERE Id = 19; -- Sinh tố protein (Giả định ID 19, 20 là các món bổ sung nếu có)

GO

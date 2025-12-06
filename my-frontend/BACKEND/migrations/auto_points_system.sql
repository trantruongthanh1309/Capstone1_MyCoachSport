-- ============================================
-- CẬP NHẬT HỆ THỐNG ĐIỂM TỰ ĐỘNG
-- Tích hợp với UserSchedule để tự động tính điểm
-- ============================================

USE MySportCoachAI;
GO

PRINT '========================================';
PRINT '🔄 CẬP NHẬT HỆ THỐNG ĐIỂM TỰ ĐỘNG';
PRINT '========================================';
PRINT '';

-- 1. Thêm cột IsCompleted vào UserSchedule
PRINT '1️⃣ Thêm cột IsCompleted vào UserSchedule...';
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[UserSchedule]') AND name = 'IsCompleted')
BEGIN
    ALTER TABLE [dbo].[UserSchedule] ADD [IsCompleted] BIT DEFAULT 0;
    PRINT '✅ Đã thêm cột IsCompleted';
END
ELSE
BEGIN
    PRINT '⚠️ Cột IsCompleted đã tồn tại';
END
GO

-- 2. Thêm cột CompletedAt vào UserSchedule
PRINT '2️⃣ Thêm cột CompletedAt vào UserSchedule...';
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[UserSchedule]') AND name = 'CompletedAt')
BEGIN
    ALTER TABLE [dbo].[UserSchedule] ADD [CompletedAt] DATETIME NULL;
    PRINT '✅ Đã thêm cột CompletedAt';
END
ELSE
BEGIN
    PRINT '⚠️ Cột CompletedAt đã tồn tại';
END
GO

-- 3. Thêm cột PointsEarned vào UserSchedule
PRINT '3️⃣ Thêm cột PointsEarned vào UserSchedule...';
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[UserSchedule]') AND name = 'PointsEarned')
BEGIN
    ALTER TABLE [dbo].[UserSchedule] ADD [PointsEarned] INT DEFAULT 0;
    PRINT '✅ Đã thêm cột PointsEarned';
END
ELSE
BEGIN
    PRINT '⚠️ Cột PointsEarned đã tồn tại';
END
GO

-- 4. Tạo Stored Procedure tính điểm cho Workout
PRINT '4️⃣ Tạo SP tính điểm Workout...';
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_CalculateWorkoutPointsFromSchedule]
    @workout_id INT,
    @duration_minutes INT,
    @sport NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @base_points INT = 0;
    DECLARE @difficulty_multiplier DECIMAL(3,2) = 1.5; -- Default Medium
    DECLARE @sport_multiplier DECIMAL(3,2) = 1.0;
    
    -- Điểm cơ bản: 1 điểm/phút
    SET @base_points = @duration_minutes;
    
    -- Hệ số môn thể thao
    SET @sport_multiplier = CASE @sport
        WHEN N'Bóng đá' THEN 1.2
        WHEN N'Bơi lội' THEN 1.5
        WHEN N'Chạy bộ' THEN 1.0
        WHEN N'Gym' THEN 1.3
        WHEN N'Yoga' THEN 0.8
        WHEN N'Cầu lông' THEN 1.1
        WHEN N'Bóng rổ' THEN 1.2
        ELSE 1.0
    END;
    
    -- Tính tổng điểm
    DECLARE @total_points INT;
    SET @total_points = CAST(@base_points * @difficulty_multiplier * @sport_multiplier AS INT);
    
    RETURN @total_points;
END
GO
PRINT '✅ Đã tạo sp_CalculateWorkoutPointsFromSchedule';

-- 5. Tạo Stored Procedure tính điểm cho Meal
PRINT '5️⃣ Tạo SP tính điểm Meal...';
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_CalculateMealPoints]
    @meal_id INT,
    @calories INT,
    @protein INT,
    @time_slot NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @base_points INT = 0;
    DECLARE @time_multiplier DECIMAL(3,2) = 1.0;
    DECLARE @nutrition_bonus INT = 0;
    
    -- Điểm cơ bản: Calories / 10
    SET @base_points = @calories / 10;
    
    -- Hệ số theo bữa ăn (khuyến khích ăn sáng)
    SET @time_multiplier = CASE @time_slot
        WHEN 'morning' THEN 1.2  -- Ăn sáng quan trọng
        WHEN 'afternoon' THEN 1.0
        WHEN 'evening' THEN 0.9  -- Ăn tối ít hơn
        ELSE 1.0
    END;
    
    -- Bonus protein (khuyến khích ăn đủ protein)
    IF @protein >= 30
        SET @nutrition_bonus = 10;
    ELSE IF @protein >= 20
        SET @nutrition_bonus = 5;
    
    -- Tính tổng điểm
    DECLARE @total_points INT;
    SET @total_points = CAST(@base_points * @time_multiplier AS INT) + @nutrition_bonus;
    
    -- Giới hạn điểm tối đa cho 1 bữa ăn (tránh spam)
    IF @total_points > 100
        SET @total_points = 100;
    
    RETURN @total_points;
END
GO
PRINT '✅ Đã tạo sp_CalculateMealPoints';

-- 6. Tạo Trigger tự động cập nhật điểm khi complete
PRINT '6️⃣ Tạo Trigger tự động tính điểm...';
GO

CREATE OR ALTER TRIGGER [dbo].[trg_AutoCalculatePoints]
ON [dbo].[UserSchedule]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Chỉ xử lý khi IsCompleted thay đổi từ 0 -> 1
    IF UPDATE(IsCompleted)
    BEGIN
        DECLARE @schedule_id INT;
        DECLARE @user_id INT;
        DECLARE @item_type NVARCHAR(20);
        DECLARE @item_id INT;
        DECLARE @points INT = 0;
        
        -- Lấy thông tin từ record vừa update
        SELECT 
            @schedule_id = i.Id,
            @user_id = i.User_id,
            @item_type = i.ItemType,
            @item_id = i.ItemId
        FROM inserted i
        INNER JOIN deleted d ON i.Id = d.Id
        WHERE i.IsCompleted = 1 AND d.IsCompleted = 0;
        
        -- Nếu không có record nào thay đổi thì return
        IF @schedule_id IS NULL
            RETURN;
        
        -- Tính điểm dựa trên loại item
        IF @item_type = 'workout'
        BEGIN
            -- Lấy thông tin workout
            DECLARE @duration INT, @sport NVARCHAR(50);
            SELECT @duration = Duration, @sport = Sport
            FROM Workouts
            WHERE Id = @item_id;
            
            -- Tính điểm
            EXEC @points = sp_CalculateWorkoutPointsFromSchedule @item_id, @duration, @sport;
            
            -- Lưu vào WorkoutLogs
            INSERT INTO WorkoutLogs (User_id, Workout_name, Sport, Duration_minutes, Difficulty, Points_earned, Completed_at)
            SELECT @user_id, Name, Sport, Duration, 'Medium', @points, GETDATE()
            FROM Workouts
            WHERE Id = @item_id;
        END
        ELSE IF @item_type = 'meal'
        BEGIN
            -- Lấy thông tin meal
            DECLARE @calories INT, @protein INT, @time_slot NVARCHAR(50);
            SELECT @calories = Calories, @protein = Protein
            FROM Meals
            WHERE Id = @item_id;
            
            -- Xác định time_slot từ schedule
            SELECT @time_slot = TimeSlot
            FROM UserSchedule
            WHERE Id = @schedule_id;
            
            -- Tính điểm
            EXEC @points = sp_CalculateMealPoints @item_id, @calories, @protein, @time_slot;
        END
        
        -- Cập nhật điểm vào UserSchedule
        UPDATE UserSchedule
        SET PointsEarned = @points,
            CompletedAt = GETDATE()
        WHERE Id = @schedule_id;
        
        -- Cập nhật UserStats
        IF NOT EXISTS (SELECT 1 FROM UserStats WHERE User_id = @user_id)
        BEGIN
            INSERT INTO UserStats (User_id, Total_points, Total_workouts, Current_streak)
            VALUES (@user_id, @points, 1, 1);
        END
        ELSE
        BEGIN
            UPDATE UserStats
            SET Total_points = Total_points + @points,
                Total_workouts = Total_workouts + 1,
                Updated_at = GETDATE()
            WHERE User_id = @user_id;
            
            -- Cập nhật streak
            EXEC sp_UpdateUserStreak @user_id;
        END
        
        -- Cập nhật Level
        UPDATE UserStats
        SET Level = (Total_points / 1000) + 1,
            Experience = Total_points % 1000
        WHERE User_id = @user_id;
    END
END
GO
PRINT '✅ Đã tạo trg_AutoCalculatePoints';

PRINT '';
PRINT '========================================';
PRINT '✅ HOÀN THÀNH CẬP NHẬT!';
PRINT '========================================';
PRINT '';
PRINT '📊 Hệ thống mới:';
PRINT '  - UserSchedule có IsCompleted, CompletedAt, PointsEarned';
PRINT '  - Tự động tính điểm khi user tick hoàn thành';
PRINT '  - Điểm workout: Thời gian × Độ khó × Hệ số môn';
PRINT '  - Điểm meal: (Calories/10) × Hệ số bữa + Bonus protein';
PRINT '  - Trigger tự động cập nhật UserStats';
PRINT '';
PRINT '🎯 Công thức điểm:';
PRINT '  Workout: 30 phút Bóng đá = 30 × 1.5 × 1.2 = 54 điểm';
PRINT '  Meal: 500 cal buổi sáng + 25g protein = 50 × 1.2 + 5 = 65 điểm';
PRINT '';

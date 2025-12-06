-- ============================================
-- SCRIPT SỬA LỖI VÀ BỔ SUNG
-- Chạy script này để sửa các lỗi còn thiếu
-- ============================================

USE MySportCoachAI;
GO

PRINT '========================================';
PRINT '🔧 BẮT ĐẦU SỬA LỖI HỆ THỐNG';
PRINT '========================================';
PRINT '';

-- 1. Tạo lại Stored Procedure sp_UpdateUserStreak
PRINT '1️⃣ Tạo sp_UpdateUserStreak...';
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateUserStreak]
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @last_workout_date DATE;
    DECLARE @current_streak INT;
    DECLARE @today DATE = CAST(GETDATE() AS DATE);
    
    -- Kiểm tra xem user đã có stats chưa
    IF NOT EXISTS (SELECT 1 FROM [UserStats] WHERE [User_id] = @user_id)
    BEGIN
        -- Tạo mới nếu chưa có
        INSERT INTO [UserStats] ([User_id], [Current_streak], [Last_workout_date])
        VALUES (@user_id, 1, @today);
        RETURN;
    END
    
    SELECT @last_workout_date = [Last_workout_date], @current_streak = [Current_streak]
    FROM [UserStats]
    WHERE [User_id] = @user_id;
    
    -- Nếu tập hôm nay rồi
    IF @last_workout_date = @today
    BEGIN
        RETURN; -- Đã tập rồi, không cần cập nhật
    END
    
    -- Nếu tập hôm qua -> tăng streak
    IF @last_workout_date = DATEADD(DAY, -1, @today)
    BEGIN
        UPDATE [UserStats]
        SET [Current_streak] = [Current_streak] + 1,
            [Longest_streak] = CASE WHEN [Current_streak] + 1 > [Longest_streak] 
                                    THEN [Current_streak] + 1 
                                    ELSE [Longest_streak] END,
            [Last_workout_date] = @today,
            [Updated_at] = GETDATE()
        WHERE [User_id] = @user_id;
    END
    ELSE
    BEGIN
        -- Bỏ lỡ -> reset streak
        UPDATE [UserStats]
        SET [Current_streak] = 1,
            [Last_workout_date] = @today,
            [Updated_at] = GETDATE()
        WHERE [User_id] = @user_id;
    END
END
GO
PRINT '✅ Đã tạo sp_UpdateUserStreak';
PRINT '';

-- 2. Tạo lại View vw_Leaderboard
PRINT '2️⃣ Tạo vw_Leaderboard...';
GO

CREATE OR ALTER VIEW [dbo].[vw_Leaderboard] AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY ISNULL(us.[Total_points], 0) DESC) AS [Rank],
    u.[Id] AS [User_id],
    u.[Name] AS [User_name],
    u.[Avatar],
    u.[Sport],
    ISNULL(us.[Total_points], 0) AS [Total_points],
    ISNULL(us.[Total_workouts], 0) AS [Total_workouts],
    ISNULL(us.[Current_streak], 0) AS [Current_streak],
    ISNULL(us.[Longest_streak], 0) AS [Longest_streak],
    ISNULL(us.[Level], 1) AS [Level],
    ISNULL(us.[Experience], 0) AS [Experience],
    COUNT(ua.[Achievement_id]) AS [Achievements_count]
FROM [Users] u
LEFT JOIN [UserStats] us ON u.[Id] = us.[User_id]
LEFT JOIN [UserAchievements] ua ON u.[Id] = ua.[User_id]
GROUP BY u.[Id], u.[Name], u.[Avatar], u.[Sport], 
         us.[Total_points], us.[Total_workouts], us.[Current_streak], 
         us.[Longest_streak], us.[Level], us.[Experience];
GO
PRINT '✅ Đã tạo vw_Leaderboard';
PRINT '';

-- 3. Tạo lại Trigger trg_UpdateStatsOnWorkout
PRINT '3️⃣ Tạo trg_UpdateStatsOnWorkout...';
GO

CREATE OR ALTER TRIGGER [dbo].[trg_UpdateStatsOnWorkout]
ON [dbo].[WorkoutLogs]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @user_id INT;
    DECLARE @points INT;
    
    SELECT @user_id = [User_id], @points = [Points_earned]
    FROM inserted;
    
    -- Kiểm tra xem user đã có trong UserStats chưa
    IF NOT EXISTS (SELECT 1 FROM [UserStats] WHERE [User_id] = @user_id)
    BEGIN
        INSERT INTO [UserStats] ([User_id], [Total_points], [Total_workouts], [Current_streak], [Last_workout_date])
        VALUES (@user_id, @points, 1, 1, CAST(GETDATE() AS DATE));
    END
    ELSE
    BEGIN
        UPDATE [UserStats]
        SET [Total_points] = [Total_points] + @points,
            [Total_workouts] = [Total_workouts] + 1,
            [Updated_at] = GETDATE()
        WHERE [User_id] = @user_id;
        
        -- Cập nhật streak
        EXEC [sp_UpdateUserStreak] @user_id;
    END
    
    -- Cập nhật Level dựa trên Total_points
    UPDATE [UserStats]
    SET [Level] = ([Total_points] / 1000) + 1,
        [Experience] = [Total_points] % 1000
    WHERE [User_id] = @user_id;
END
GO
PRINT '✅ Đã tạo trg_UpdateStatsOnWorkout';
PRINT '';

-- 4. Cập nhật UserStats cho user đã có workout log
PRINT '4️⃣ Cập nhật UserStats cho users hiện có...';

-- Tạo hoặc cập nhật UserStats cho tất cả users có workout logs
MERGE INTO [UserStats] AS target
USING (
    SELECT 
        wl.[User_id],
        SUM(wl.[Points_earned]) AS [Total_points],
        COUNT(*) AS [Total_workouts],
        MAX(CAST(wl.[Completed_at] AS DATE)) AS [Last_workout_date]
    FROM [WorkoutLogs] wl
    GROUP BY wl.[User_id]
) AS source
ON target.[User_id] = source.[User_id]
WHEN MATCHED THEN
    UPDATE SET
        target.[Total_points] = source.[Total_points],
        target.[Total_workouts] = source.[Total_workouts],
        target.[Last_workout_date] = source.[Last_workout_date],
        target.[Level] = (source.[Total_points] / 1000) + 1,
        target.[Experience] = source.[Total_points] % 1000,
        target.[Updated_at] = GETDATE()
WHEN NOT MATCHED THEN
    INSERT ([User_id], [Total_points], [Total_workouts], [Last_workout_date], [Current_streak], [Level], [Experience])
    VALUES (source.[User_id], source.[Total_points], source.[Total_workouts], source.[Last_workout_date], 1, 
            (source.[Total_points] / 1000) + 1, source.[Total_points] % 1000);

DECLARE @updated_count INT = @@ROWCOUNT;
PRINT '✅ Đã cập nhật ' + CAST(@updated_count AS VARCHAR(10)) + ' UserStats records';
PRINT '';

-- 5. Test lại các components
PRINT '========================================';
PRINT '🧪 TEST LẠI HỆ THỐNG';
PRINT '========================================';
PRINT '';

-- Test Stored Procedure
PRINT '✅ Test sp_UpdateUserStreak...';
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateUserStreak')
    PRINT '   ✓ sp_UpdateUserStreak exists'
ELSE
    PRINT '   ✗ sp_UpdateUserStreak NOT found';

-- Test View
PRINT '✅ Test vw_Leaderboard...';
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_Leaderboard')
BEGIN
    PRINT '   ✓ vw_Leaderboard exists';
    
    -- Thử query view
    BEGIN TRY
        SELECT TOP 1 * FROM [vw_Leaderboard];
        PRINT '   ✓ View query successful';
    END TRY
    BEGIN CATCH
        PRINT '   ✗ View query failed: ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
    PRINT '   ✗ vw_Leaderboard NOT found';

-- Test Trigger
PRINT '✅ Test trg_UpdateStatsOnWorkout...';
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_UpdateStatsOnWorkout')
    PRINT '   ✓ trg_UpdateStatsOnWorkout exists'
ELSE
    PRINT '   ✗ trg_UpdateStatsOnWorkout NOT found';

PRINT '';

-- 6. Hiển thị kết quả
PRINT '========================================';
PRINT '📊 KẾT QUẢ HIỆN TẠI';
PRINT '========================================';
PRINT '';

-- Số lượng users có stats
DECLARE @stats_count INT;
SELECT @stats_count = COUNT(*) FROM [UserStats];
PRINT 'Số users có stats: ' + CAST(@stats_count AS VARCHAR(10));

-- Top 5 leaderboard
PRINT '';
PRINT 'Top 5 Leaderboard:';
SELECT TOP 5 
    [Rank] AS 'Hạng',
    [User_name] AS 'Tên',
    [Total_points] AS 'Điểm',
    [Total_workouts] AS 'Bài tập',
    [Current_streak] AS 'Streak',
    [Level] AS 'Level'
FROM [vw_Leaderboard]
ORDER BY [Rank];

PRINT '';
PRINT '========================================';
PRINT '✅ HOÀN THÀNH SỬA LỖI!';
PRINT '========================================';
PRINT '';
PRINT '🎉 Hệ thống đã sẵn sàng sử dụng!';
PRINT '';

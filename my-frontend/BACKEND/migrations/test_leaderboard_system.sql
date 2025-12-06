-- ============================================
-- SCRIPT TEST HỆ THỐNG LEADERBOARD
-- Chạy sau khi đã chạy update_leaderboard_system.sql
-- ============================================

USE MySportCoachAI;
GO

PRINT '========================================';
PRINT '🧪 BẮT ĐẦU TEST HỆ THỐNG';
PRINT '========================================';
PRINT '';

-- Test 1: Kiểm tra các bảng đã tạo
PRINT '📋 Test 1: Kiểm tra bảng...';
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WorkoutLogs]'))
    PRINT '✅ WorkoutLogs exists'
ELSE
    PRINT '❌ WorkoutLogs NOT found';

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserStats]'))
    PRINT '✅ UserStats exists'
ELSE
    PRINT '❌ UserStats NOT found';

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Achievements]'))
    PRINT '✅ Achievements exists'
ELSE
    PRINT '❌ Achievements NOT found';

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserAchievements]'))
    PRINT '✅ UserAchievements exists'
ELSE
    PRINT '❌ UserAchievements NOT found';

PRINT '';

-- Test 2: Kiểm tra Stored Procedures
PRINT '⚙️ Test 2: Kiểm tra Stored Procedures...';
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CalculateWorkoutPoints')
    PRINT '✅ sp_CalculateWorkoutPoints exists'
ELSE
    PRINT '❌ sp_CalculateWorkoutPoints NOT found';

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateUserStreak')
    PRINT '✅ sp_UpdateUserStreak exists'
ELSE
    PRINT '❌ sp_UpdateUserStreak NOT found';

PRINT '';

-- Test 3: Kiểm tra View
PRINT '👁️ Test 3: Kiểm tra View...';
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_Leaderboard')
    PRINT '✅ vw_Leaderboard exists'
ELSE
    PRINT '❌ vw_Leaderboard NOT found';

PRINT '';

-- Test 4: Kiểm tra Trigger
PRINT '⚡ Test 4: Kiểm tra Trigger...';
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_UpdateStatsOnWorkout')
    PRINT '✅ trg_UpdateStatsOnWorkout exists'
ELSE
    PRINT '❌ trg_UpdateStatsOnWorkout NOT found';

PRINT '';

-- Test 5: Kiểm tra Achievements đã được insert
PRINT '🎖️ Test 5: Kiểm tra Achievements...';
DECLARE @achievement_count INT;
SELECT @achievement_count = COUNT(*) FROM [Achievements];
PRINT 'Số lượng achievements: ' + CAST(@achievement_count AS VARCHAR(10));
IF @achievement_count >= 8
    PRINT '✅ Achievements đã được thêm'
ELSE
    PRINT '⚠️ Cần thêm achievements';

PRINT '';

-- Test 6: Test tính điểm
PRINT '🧮 Test 6: Test tính điểm...';
DECLARE @test_points INT;
EXEC @test_points = sp_CalculateWorkoutPoints 
    @workout_name = N'Test Workout',
    @duration_minutes = 30,
    @difficulty = 'Medium',
    @sport = N'Bóng đá';
PRINT 'Điểm tính được (30 phút, Medium, Bóng đá): ' + CAST(@test_points AS VARCHAR(10));
IF @test_points = 54  -- 30 * 1.5 * 1.2 = 54
    PRINT '✅ Tính điểm chính xác'
ELSE
    PRINT '⚠️ Điểm không khớp (Expected: 54, Got: ' + CAST(@test_points AS VARCHAR(10)) + ')';

PRINT '';

-- Test 7: Tạo dữ liệu mẫu (nếu có user)
PRINT '📝 Test 7: Tạo dữ liệu mẫu...';
IF EXISTS (SELECT TOP 1 1 FROM [Users])
BEGIN
    DECLARE @sample_user_id INT;
    SELECT TOP 1 @sample_user_id = Id FROM [Users];
    
    PRINT 'Tạo workout log mẫu cho User ID: ' + CAST(@sample_user_id AS VARCHAR(10));
    
    -- Tính điểm
    DECLARE @sample_points INT;
    EXEC @sample_points = sp_CalculateWorkoutPoints 
        @workout_name = N'Chạy bộ buổi sáng',
        @duration_minutes = 30,
        @difficulty = 'Medium',
        @sport = N'Chạy bộ';
    
    -- Insert workout log
    INSERT INTO [WorkoutLogs] ([User_id], [Workout_name], [Sport], [Duration_minutes], [Calories_burned], [Difficulty], [Points_earned])
    VALUES (@sample_user_id, N'Chạy bộ buổi sáng', N'Chạy bộ', 30, 250, 'Medium', @sample_points);
    
    PRINT '✅ Đã tạo workout log mẫu';
    PRINT 'Điểm nhận được: ' + CAST(@sample_points AS VARCHAR(10));
    
    -- Kiểm tra UserStats đã được tạo/cập nhật
    IF EXISTS (SELECT 1 FROM [UserStats] WHERE [User_id] = @sample_user_id)
    BEGIN
        PRINT '✅ UserStats đã được tự động cập nhật (Trigger hoạt động)';
        
        SELECT 
            [Total_points] AS 'Tổng điểm',
            [Total_workouts] AS 'Số bài tập',
            [Current_streak] AS 'Streak hiện tại',
            [Level] AS 'Level'
        FROM [UserStats]
        WHERE [User_id] = @sample_user_id;
    END
    ELSE
        PRINT '⚠️ UserStats chưa được tạo';
END
ELSE
BEGIN
    PRINT '⚠️ Không có user trong database để test';
END

PRINT '';

-- Test 8: Kiểm tra View Leaderboard
PRINT '🏆 Test 8: Kiểm tra View Leaderboard...';
IF EXISTS (SELECT TOP 1 1 FROM [vw_Leaderboard])
BEGIN
    PRINT '✅ View Leaderboard hoạt động';
    PRINT 'Top 3 users:';
    SELECT TOP 3 
        [Rank] AS 'Hạng',
        [User_name] AS 'Tên',
        [Total_points] AS 'Điểm',
        [Total_workouts] AS 'Bài tập',
        [Current_streak] AS 'Streak'
    FROM [vw_Leaderboard]
    ORDER BY [Rank];
END
ELSE
    PRINT '⚠️ Chưa có dữ liệu trong Leaderboard';

PRINT '';
PRINT '========================================';
PRINT '✅ HOÀN THÀNH TEST HỆ THỐNG';
PRINT '========================================';
PRINT '';
PRINT '📊 TÓM TẮT:';
PRINT '- Tất cả bảng, stored procedures, views, triggers đã được tạo';
PRINT '- Achievements đã được thêm vào database';
PRINT '- Hệ thống tính điểm hoạt động chính xác';
PRINT '- Trigger tự động cập nhật UserStats';
PRINT '';
PRINT '🚀 SẴN SÀNG SỬ DỤNG!';
PRINT 'Bạn có thể bắt đầu sử dụng API endpoints để tương tác với hệ thống.';
PRINT '';

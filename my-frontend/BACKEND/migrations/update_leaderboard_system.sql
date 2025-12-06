-- ============================================
-- SCRIPT CẬP NHẬT HỆ THỐNG BẢNG XẾP HẠNG
-- MySportCoachAI - Professional Leaderboard System
-- ============================================

USE MySportCoachAI;
GO

-- 1. Tạo bảng WorkoutLogs để lưu lịch sử tập luyện
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WorkoutLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[WorkoutLogs] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [User_id] INT NOT NULL,
        [Workout_name] NVARCHAR(255) NOT NULL,
        [Sport] NVARCHAR(50),
        [Duration_minutes] INT,
        [Calories_burned] INT,
        [Difficulty] NVARCHAR(20), -- Easy, Medium, Hard, Expert
        [Completed_at] DATETIME DEFAULT GETDATE(),
        [Points_earned] INT DEFAULT 0,
        FOREIGN KEY ([User_id]) REFERENCES [Users]([Id]) ON DELETE CASCADE
    );
    PRINT '✅ Tạo bảng WorkoutLogs thành công';
END
ELSE
BEGIN
    PRINT '⚠️ Bảng WorkoutLogs đã tồn tại';
END
GO

-- 2. Tạo bảng UserStats để lưu thống kê tổng hợp
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserStats]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserStats] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [User_id] INT NOT NULL UNIQUE,
        [Total_points] INT DEFAULT 0,
        [Total_workouts] INT DEFAULT 0,
        [Current_streak] INT DEFAULT 0, -- Số ngày tập liên tục
        [Longest_streak] INT DEFAULT 0,
        [Last_workout_date] DATE,
        [Level] INT DEFAULT 1,
        [Experience] INT DEFAULT 0,
        [Rank] INT,
        [Updated_at] DATETIME DEFAULT GETDATE(),
        FOREIGN KEY ([User_id]) REFERENCES [Users]([Id]) ON DELETE CASCADE
    );
    PRINT '✅ Tạo bảng UserStats thành công';
END
ELSE
BEGIN
    PRINT '⚠️ Bảng UserStats đã tồn tại';
END
GO

-- 3. Tạo bảng Achievements (Thành tựu)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Achievements]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Achievements] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(500),
        [Icon] NVARCHAR(50),
        [Points_reward] INT DEFAULT 0,
        [Requirement_type] NVARCHAR(50), -- streak, workouts, points, etc.
        [Requirement_value] INT,
        [Created_at] DATETIME DEFAULT GETDATE()
    );
    PRINT '✅ Tạo bảng Achievements thành công';
END
ELSE
BEGIN
    PRINT '⚠️ Bảng Achievements đã tồn tại';
END
GO

-- 4. Tạo bảng UserAchievements (Thành tựu của người dùng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserAchievements]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserAchievements] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [User_id] INT NOT NULL,
        [Achievement_id] INT NOT NULL,
        [Unlocked_at] DATETIME DEFAULT GETDATE(),
        FOREIGN KEY ([User_id]) REFERENCES [Users]([Id]) ON DELETE CASCADE,
        FOREIGN KEY ([Achievement_id]) REFERENCES [Achievements]([Id]) ON DELETE CASCADE,
        UNIQUE([User_id], [Achievement_id])
    );
    PRINT '✅ Tạo bảng UserAchievements thành công';
END
ELSE
BEGIN
    PRINT '⚠️ Bảng UserAchievements đã tồn tại';
END
GO

-- 5. Cập nhật bảng Leaderboard hiện có (nếu cần)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Leaderboard]') AND type in (N'U'))
BEGIN
    -- Thêm cột mới nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Leaderboard]') AND name = 'Sport')
    BEGIN
        ALTER TABLE [dbo].[Leaderboard] ADD [Sport] NVARCHAR(50);
        PRINT '✅ Thêm cột Sport vào Leaderboard';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Leaderboard]') AND name = 'Difficulty')
    BEGIN
        ALTER TABLE [dbo].[Leaderboard] ADD [Difficulty] NVARCHAR(20);
        PRINT '✅ Thêm cột Difficulty vào Leaderboard';
    END
END
GO

-- 6. Tạo Stored Procedure để tính điểm
CREATE OR ALTER PROCEDURE [dbo].[sp_CalculateWorkoutPoints]
    @workout_name NVARCHAR(255),
    @duration_minutes INT,
    @difficulty NVARCHAR(20),
    @sport NVARCHAR(50)
AS
BEGIN
    DECLARE @base_points INT = 0;
    DECLARE @difficulty_multiplier DECIMAL(3,2) = 1.0;
    DECLARE @sport_multiplier DECIMAL(3,2) = 1.0;
    
    -- Điểm cơ bản theo thời gian (1 điểm / phút)
    SET @base_points = @duration_minutes;
    
    -- Hệ số độ khó
    SET @difficulty_multiplier = CASE @difficulty
        WHEN 'Easy' THEN 1.0
        WHEN 'Medium' THEN 1.5
        WHEN 'Hard' THEN 2.0
        WHEN 'Expert' THEN 3.0
        ELSE 1.0
    END;
    
    -- Hệ số môn thể thao (môn khó hơn = điểm cao hơn)
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
PRINT '✅ Tạo Stored Procedure sp_CalculateWorkoutPoints';

-- 7. Tạo Stored Procedure để cập nhật streak
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateUserStreak]
    @user_id INT
AS
BEGIN
    DECLARE @last_workout_date DATE;
    DECLARE @current_streak INT;
    DECLARE @today DATE = CAST(GETDATE() AS DATE);
    
    SELECT @last_workout_date = [Last_workout_date], @current_streak = [Current_streak]
    FROM [UserStats]
    WHERE [User_id] = @user_id;
    
    -- Nếu tập hôm nay
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
            [Last_workout_date] = @today
        WHERE [User_id] = @user_id;
    END
    ELSE
    BEGIN
        -- Bỏ lỡ -> reset streak
        UPDATE [UserStats]
        SET [Current_streak] = 1,
            [Last_workout_date] = @today
        WHERE [User_id] = @user_id;
    END
END
GO
PRINT '✅ Tạo Stored Procedure sp_UpdateUserStreak';

-- 8. Tạo View để hiển thị bảng xếp hạng
CREATE OR ALTER VIEW [dbo].[vw_Leaderboard] AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY us.[Total_points] DESC) AS [Rank],
    u.[Id] AS [User_id],
    u.[Name] AS [User_name],
    u.[Avatar],
    u.[Sport],
    us.[Total_points],
    us.[Total_workouts],
    us.[Current_streak],
    us.[Longest_streak],
    us.[Level],
    us.[Experience],
    COUNT(ua.[Achievement_id]) AS [Achievements_count]
FROM [Users] u
INNER JOIN [UserStats] us ON u.[Id] = us.[User_id]
LEFT JOIN [UserAchievements] ua ON u.[Id] = ua.[User_id]
GROUP BY u.[Id], u.[Name], u.[Avatar], u.[Sport], 
         us.[Total_points], us.[Total_workouts], us.[Current_streak], 
         us.[Longest_streak], us.[Level], us.[Experience];
GO
PRINT '✅ Tạo View vw_Leaderboard';

-- 9. Thêm dữ liệu mẫu cho Achievements
INSERT INTO [Achievements] ([Name], [Description], [Icon], [Points_reward], [Requirement_type], [Requirement_value])
VALUES 
    (N'Người mới bắt đầu', N'Hoàn thành bài tập đầu tiên', '🌱', 10, 'workouts', 1),
    (N'Kiên trì', N'Tập luyện 7 ngày liên tục', '🔥', 50, 'streak', 7),
    (N'Chiến binh', N'Tập luyện 30 ngày liên tục', '⚔️', 200, 'streak', 30),
    (N'Huyền thoại', N'Tập luyện 100 ngày liên tục', '👑', 1000, 'streak', 100),
    (N'Người chăm chỉ', N'Hoàn thành 50 bài tập', '💪', 100, 'workouts', 50),
    (N'Chuyên gia', N'Hoàn thành 200 bài tập', '🏆', 500, 'workouts', 200),
    (N'Thạc sĩ thể thao', N'Đạt 1000 điểm', '🎓', 100, 'points', 1000),
    (N'Tiến sĩ thể thao', N'Đạt 5000 điểm', '🔬', 500, 'points', 5000);
GO
PRINT '✅ Thêm dữ liệu mẫu cho Achievements';

-- 10. Tạo Trigger để tự động cập nhật UserStats khi có workout mới
CREATE OR ALTER TRIGGER [dbo].[trg_UpdateStatsOnWorkout]
ON [dbo].[WorkoutLogs]
AFTER INSERT
AS
BEGIN
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
    
    -- Cập nhật Level dựa trên Experience
    UPDATE [UserStats]
    SET [Level] = ([Total_points] / 1000) + 1,
        [Experience] = [Total_points] % 1000
    WHERE [User_id] = @user_id;
END
GO
PRINT '✅ Tạo Trigger trg_UpdateStatsOnWorkout';

PRINT '';
PRINT '========================================';
PRINT '✅ HOÀN THÀNH CẬP NHẬT HỆ THỐNG!';
PRINT '========================================';
PRINT 'Các bảng đã tạo:';
PRINT '  - WorkoutLogs: Lưu lịch sử tập luyện';
PRINT '  - UserStats: Thống kê người dùng';
PRINT '  - Achievements: Danh sách thành tựu';
PRINT '  - UserAchievements: Thành tựu đã mở khóa';
PRINT '';
PRINT 'Các Stored Procedure:';
PRINT '  - sp_CalculateWorkoutPoints: Tính điểm';
PRINT '  - sp_UpdateUserStreak: Cập nhật streak';
PRINT '';
PRINT 'View: vw_Leaderboard';
PRINT 'Trigger: trg_UpdateStatsOnWorkout';
PRINT '========================================';

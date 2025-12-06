-- ============================================
-- THÊM CỘT IsCompleted VÀO UserPlans
-- ============================================

USE MySportCoachAI;
GO

PRINT '========================================';
PRINT '🔧 THÊM CỘT IsCompleted VÀO UserPlans';
PRINT '========================================';
PRINT '';

-- Kiểm tra và thêm cột IsCompleted
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[UserPlans]') AND name = 'IsCompleted')
BEGIN
    ALTER TABLE [dbo].[UserPlans] ADD [IsCompleted] BIT DEFAULT 0;
    PRINT '✅ Đã thêm cột IsCompleted vào UserPlans';
END
ELSE
BEGIN
    PRINT '⚠️ Cột IsCompleted đã tồn tại';
END
GO

PRINT '';
PRINT '========================================';
PRINT '✅ HOÀN THÀNH!';
PRINT '========================================';
PRINT '';
PRINT 'Bây giờ có thể sử dụng nút "Hoàn thành" trong Planner!';
PRINT '';

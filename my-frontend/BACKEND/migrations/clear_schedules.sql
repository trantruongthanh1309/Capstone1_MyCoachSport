-- ============================================
-- TẠO LẠI LỊCH TẬP LUYỆN ĐẦY ĐỦ HƠN
-- Xóa lịch cũ và tạo lại với 2 workouts/ngày
-- ============================================

USE MySportCoachAI;
GO

PRINT '========================================';
PRINT '🔄 XÓA LỊCH CŨ VÀ TẠO LẠI';
PRINT '========================================';
PRINT '';

-- Xóa tất cả lịch trong UserPlans (để tạo lại)
DELETE FROM UserPlans;
PRINT '✅ Đã xóa tất cả lịch cũ trong UserPlans';

PRINT '';
PRINT '========================================';
PRINT '✅ HOÀN THÀNH!';
PRINT '========================================';
PRINT '';
PRINT 'Bây giờ refresh trang Planner để AI tạo lại lịch mới với 2 workouts/ngày!';
PRINT '';

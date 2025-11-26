-- ⚡ CHẠY SCRIPT NÀY TRONG SQL SERVER MANAGEMENT STUDIO
-- Database: MySportCoachAI

USE MySportCoachAI;
GO

-- Thêm các cột mới vào bảng Users
ALTER TABLE Users ADD Avatar NVARCHAR(MAX) NULL;
ALTER TABLE Users ADD Bio NVARCHAR(MAX) NULL;
ALTER TABLE Users ADD Preferences NVARCHAR(MAX) NULL;
ALTER TABLE Users ADD Privacy NVARCHAR(MAX) NULL;
ALTER TABLE Users ADD NotificationSettings NVARCHAR(MAX) NULL;
GO

PRINT '✅ Đã thêm 5 cột mới vào bảng Users!';
GO

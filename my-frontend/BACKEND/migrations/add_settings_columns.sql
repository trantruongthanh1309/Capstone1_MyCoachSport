-- Migration script to add Settings fields to Users table
-- Run this in SQL Server Management Studio

USE MySportCoachAI;
GO

-- Add Avatar column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Avatar')
BEGIN
    ALTER TABLE Users ADD Avatar NVARCHAR(MAX) NULL;
    PRINT 'Added Avatar column';
END
ELSE
BEGIN
    PRINT 'Avatar column already exists';
END
GO

-- Add Bio column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Bio')
BEGIN
    ALTER TABLE Users ADD Bio NVARCHAR(MAX) NULL;
    PRINT 'Added Bio column';
END
ELSE
BEGIN
    PRINT 'Bio column already exists';
END
GO

-- Add Preferences column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Preferences')
BEGIN
    ALTER TABLE Users ADD Preferences NVARCHAR(MAX) NULL;
    PRINT 'Added Preferences column';
END
ELSE
BEGIN
    PRINT 'Preferences column already exists';
END
GO

-- Add Privacy column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Privacy')
BEGIN
    ALTER TABLE Users ADD Privacy NVARCHAR(MAX) NULL;
    PRINT 'Added Privacy column';
END
ELSE
BEGIN
    PRINT 'Privacy column already exists';
END
GO

-- Add NotificationSettings column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'NotificationSettings')
BEGIN
    ALTER TABLE Users ADD NotificationSettings NVARCHAR(MAX) NULL;
    PRINT 'Added NotificationSettings column';
END
ELSE
BEGIN
    PRINT 'NotificationSettings column already exists';
END
GO

PRINT 'Migration completed successfully!';
GO

-- Migration: Add Settings Columns to Users Table
-- Date: 2025-11-28
-- Description: Add Avatar, Bio, Preferences, Privacy, and NotificationSettings columns

USE MySportCoachAI;
GO

-- Check if columns exist before adding them
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Avatar')
BEGIN
    ALTER TABLE [dbo].[Users]
    ADD [Avatar] NVARCHAR(MAX) NULL;
    PRINT '✅ Added Avatar column';
END
ELSE
BEGIN
    PRINT '⚠️ Avatar column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Bio')
BEGIN
    ALTER TABLE [dbo].[Users]
    ADD [Bio] NVARCHAR(MAX) NULL;
    PRINT '✅ Added Bio column';
END
ELSE
BEGIN
    PRINT '⚠️ Bio column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Preferences')
BEGIN
    ALTER TABLE [dbo].[Users]
    ADD [Preferences] NVARCHAR(MAX) NULL;
    PRINT '✅ Added Preferences column';
END
ELSE
BEGIN
    PRINT '⚠️ Preferences column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Privacy')
BEGIN
    ALTER TABLE [dbo].[Users]
    ADD [Privacy] NVARCHAR(MAX) NULL;
    PRINT '✅ Added Privacy column';
END
ELSE
BEGIN
    PRINT '⚠️ Privacy column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'NotificationSettings')
BEGIN
    ALTER TABLE [dbo].[Users]
    ADD [NotificationSettings] NVARCHAR(MAX) NULL;
    PRINT '✅ Added NotificationSettings column';
END
ELSE
BEGIN
    PRINT '⚠️ NotificationSettings column already exists';
END
GO

PRINT '✅ Migration completed successfully!';
GO

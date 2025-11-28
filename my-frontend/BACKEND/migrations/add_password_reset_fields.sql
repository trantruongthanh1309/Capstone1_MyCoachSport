-- Migration: Add password reset fields to accounts table
-- Date: 2025-11-28

USE MySportCoachAI;
GO

-- Check if columns exist before adding them
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[accounts]') AND name = 'ResetToken')
BEGIN
    ALTER TABLE accounts ADD ResetToken NVARCHAR(6) NULL;
    PRINT 'Added ResetToken column';
END
ELSE
BEGIN
    PRINT 'ResetToken column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[accounts]') AND name = 'ResetTokenExpiry')
BEGIN
    ALTER TABLE accounts ADD ResetTokenExpiry DATETIME NULL;
    PRINT 'Added ResetTokenExpiry column';
END
ELSE
BEGIN
    PRINT 'ResetTokenExpiry column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[accounts]') AND name = 'CreatedAt')
BEGIN
    ALTER TABLE accounts ADD CreatedAt DATETIME DEFAULT GETUTCDATE();
    PRINT 'Added CreatedAt column';
END
ELSE
BEGIN
    PRINT 'CreatedAt column already exists';
END
GO

PRINT 'Migration completed successfully!';
GO

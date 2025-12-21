-- Migration: Add VideoUrl column to Meals table
USE MySportCoachAI;
GO

-- Check if column already exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Meals]') 
    AND name = 'VideoUrl'
)
BEGIN
    ALTER TABLE Meals
    ADD VideoUrl NVARCHAR(500) NULL;
    PRINT '✅ Added VideoUrl column to Meals table.';
END
ELSE
BEGIN
    PRINT '⚠️ VideoUrl column already exists in Meals table.';
END
GO


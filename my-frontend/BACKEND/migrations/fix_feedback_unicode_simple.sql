-- Fix Feedback table to support Unicode (Vietnamese)
-- Run this in SQL Server Management Studio

USE MySportCoachAI;
GO

-- Update columns to NVARCHAR for Unicode support
ALTER TABLE Feedbacks ALTER COLUMN Type NVARCHAR(50) NOT NULL;
ALTER TABLE Feedbacks ALTER COLUMN Title NVARCHAR(200) NOT NULL;
ALTER TABLE Feedbacks ALTER COLUMN Message NVARCHAR(MAX) NOT NULL;
ALTER TABLE Feedbacks ALTER COLUMN Status NVARCHAR(20);
ALTER TABLE Feedbacks ALTER COLUMN Priority NVARCHAR(20);
ALTER TABLE Feedbacks ALTER COLUMN Response NVARCHAR(MAX);

PRINT '✅ Feedback table updated to support Unicode!';












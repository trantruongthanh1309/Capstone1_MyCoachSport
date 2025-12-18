-- Fix Feedback table columns to support Unicode (Vietnamese characters)
-- Run this script to update existing Feedback table

-- Check if table exists and update columns
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Feedbacks')
BEGIN
    -- Update Type column
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Type')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Type NVARCHAR(50) NOT NULL;
    END

    -- Update Title column
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Title')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Title NVARCHAR(200) NOT NULL;
    END

    -- Update Message column
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Message')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Message NVARCHAR(MAX) NOT NULL;
    END

    -- Update Status column
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Status')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Status NVARCHAR(20);
    END

    -- Update Priority column
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Priority')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Priority NVARCHAR(20);
    END

    -- Update Response column
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Response')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Response NVARCHAR(MAX);
    END

    PRINT '✅ Feedback table columns updated to NVARCHAR (Unicode support)';
END
ELSE
BEGIN
    PRINT '⚠️ Feedbacks table does not exist. It will be created with Unicode columns when model is used.';
END










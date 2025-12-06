-- Fix UTF-8 encoding for ChatHistory table
USE MySportCoachAI;
GO

-- Alter Message column to use UTF-8 collation
ALTER TABLE ChatHistory
ALTER COLUMN Message NVARCHAR(MAX) COLLATE Vietnamese_CI_AS;

-- Alter Response column to use UTF-8 collation  
ALTER TABLE ChatHistory
ALTER COLUMN Response NVARCHAR(MAX) COLLATE Vietnamese_CI_AS;

-- Verify
SELECT COLUMN_NAME, DATA_TYPE, COLLATION_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ChatHistory' 
AND COLUMN_NAME IN ('Message', 'Response');

PRINT '✅ ChatHistory encoding fixed!';

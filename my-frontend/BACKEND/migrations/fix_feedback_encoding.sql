-- Migration: Chuyen cac cot VARCHAR sang NVARCHAR de ho tro tieng Viet
-- Table: Feedbacks

-- Check if table exists
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Feedbacks')
BEGIN
    PRINT 'Bat dau migration Feedbacks: VARCHAR -> NVARCHAR...'
    
    -- Title: VARCHAR(200) -> NVARCHAR(200)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Title')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Title NVARCHAR(200)
        PRINT '  Title: VARCHAR(200) -> NVARCHAR(200)'
    END
    
    -- Message: VARCHAR(MAX) -> NVARCHAR(MAX)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Message')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Message NVARCHAR(MAX)
        PRINT '  Message: VARCHAR(MAX) -> NVARCHAR(MAX)'
    END
    
    -- Type: VARCHAR(50) -> NVARCHAR(50)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Type')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Type NVARCHAR(50)
        PRINT '  Type: VARCHAR(50) -> NVARCHAR(50)'
    END
    
    -- Status: VARCHAR(20) -> NVARCHAR(20)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Status')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Status NVARCHAR(20)
        PRINT '  Status: VARCHAR(20) -> NVARCHAR(20)'
    END
    
    -- Priority: VARCHAR(20) -> NVARCHAR(20)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Priority')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Priority NVARCHAR(20)
        PRINT '  Priority: VARCHAR(20) -> NVARCHAR(20)'
    END
    
    -- Response: VARCHAR(MAX) -> NVARCHAR(MAX)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Response')
    BEGIN
        ALTER TABLE Feedbacks ALTER COLUMN Response NVARCHAR(MAX)
        PRINT '  Response: VARCHAR(MAX) -> NVARCHAR(MAX)'
    END
    
    PRINT 'Hoan thanh migration Feedbacks!'
    PRINT 'Luu y: Du lieu cu da luu sai encoding se KHONG tu dong sua duoc'
    PRINT '       Can XOA cac feedback cu va gui lai'
END
ELSE
BEGIN
    PRINT 'Bang Feedbacks khong ton tai!'
END


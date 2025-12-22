-- Migration: Add SharedPostId column to Messages table
-- Date: 2025-12-19
-- Description: Add SharedPostId column to support sharing posts in messages

USE MySportCoachAI;
GO

-- Check if column exists before adding it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Messages]') AND name = 'SharedPostId')
BEGIN
    ALTER TABLE [dbo].[Messages]
    ADD [SharedPostId] INT NULL;
    
    -- Add foreign key constraint
    ALTER TABLE [dbo].[Messages]
    ADD CONSTRAINT FK_Messages_SharedPost 
    FOREIGN KEY ([SharedPostId]) 
    REFERENCES [dbo].[SocialPosts](Id) 
    ON DELETE SET NULL;
    
    PRINT '✅ Added SharedPostId column to Messages table';
END
ELSE
BEGIN
    PRINT '⚠️ SharedPostId column already exists';
END
GO

PRINT '✅ Migration completed successfully!';
GO







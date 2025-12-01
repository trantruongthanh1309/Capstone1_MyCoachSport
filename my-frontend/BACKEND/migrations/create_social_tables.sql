-- Migration: Create Social Media Tables
-- Posts, Comments, Likes, Shares, Conversations, Messages

USE [MyCoachSport];
GO

-- 1. Posts Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Posts')
BEGIN
    CREATE TABLE Posts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        User_id INT NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        ImageUrl NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
        UpdatedAt DATETIME DEFAULT GETDATE(),
        
        CONSTRAINT FK_Posts_User FOREIGN KEY (User_id) 
            REFERENCES [Users](Id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_Posts_UserId ON Posts(User_id);
    CREATE INDEX IX_Posts_CreatedAt ON Posts(CreatedAt DESC);
    
    PRINT '✅ Đã tạo bảng Posts';
END

-- 2. Comments Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Comments')
BEGIN
    CREATE TABLE Comments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Post_id INT NOT NULL,
        User_id INT NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
        
        CONSTRAINT FK_Comments_Post FOREIGN KEY (Post_id) 
            REFERENCES Posts(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Comments_User FOREIGN KEY (User_id) 
            REFERENCES [Users](Id) ON DELETE NO ACTION
    );
    
    CREATE INDEX IX_Comments_PostId ON Comments(Post_id);
    CREATE INDEX IX_Comments_CreatedAt ON Comments(CreatedAt DESC);
    
    PRINT '✅ Đã tạo bảng Comments';
END

-- 3. Likes Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Likes')
BEGIN
    CREATE TABLE Likes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Post_id INT NOT NULL,
        User_id INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
        
        CONSTRAINT FK_Likes_Post FOREIGN KEY (Post_id) 
            REFERENCES Posts(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Likes_User FOREIGN KEY (User_id) 
            REFERENCES [Users](Id) ON DELETE NO ACTION,
        CONSTRAINT UQ_Likes_PostUser UNIQUE (Post_id, User_id)
    );
    
    CREATE INDEX IX_Likes_PostId ON Likes(Post_id);
    
    PRINT '✅ Đã tạo bảng Likes';
END

-- 4. Shares Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Shares')
BEGIN
    CREATE TABLE Shares (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Post_id INT NOT NULL,
        User_id INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
        
        CONSTRAINT FK_Shares_Post FOREIGN KEY (Post_id) 
            REFERENCES Posts(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Shares_User FOREIGN KEY (User_id) 
            REFERENCES [Users](Id) ON DELETE NO ACTION
    );
    
    CREATE INDEX IX_Shares_PostId ON Shares(Post_id);
    
    PRINT '✅ Đã tạo bảng Shares';
END

-- 5. Conversations Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Conversations')
BEGIN
    CREATE TABLE Conversations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        User1_id INT NOT NULL,
        User2_id INT NOT NULL,
        LastMessageAt DATETIME DEFAULT GETDATE(),
        
        CONSTRAINT FK_Conversations_User1 FOREIGN KEY (User1_id) 
            REFERENCES [Users](Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Conversations_User2 FOREIGN KEY (User2_id) 
            REFERENCES [Users](Id) ON DELETE NO ACTION
    );
    
    CREATE INDEX IX_Conversations_Users ON Conversations(User1_id, User2_id);
    
    PRINT '✅ Đã tạo bảng Conversations';
END

-- 6. Messages Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Messages')
BEGIN
    CREATE TABLE Messages (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Conversation_id INT NOT NULL,
        Sender_id INT NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        IsRead BIT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
        
        CONSTRAINT FK_Messages_Conversation FOREIGN KEY (Conversation_id) 
            REFERENCES Conversations(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Messages_Sender FOREIGN KEY (Sender_id) 
            REFERENCES [Users](Id) ON DELETE NO ACTION
    );
    
    CREATE INDEX IX_Messages_ConversationId ON Messages(Conversation_id);
    CREATE INDEX IX_Messages_CreatedAt ON Messages(CreatedAt DESC);
    
    PRINT '✅ Đã tạo bảng Messages';
END

PRINT '🎉 Hoàn thành tạo tất cả bảng Social Media!';
GO

USE MySportCoachAI;
GO

-- Sửa lỗi thiếu cột VideoUrl trong bảng Workouts
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Workouts') AND name = 'VideoUrl')
BEGIN
    ALTER TABLE Workouts ADD VideoUrl NVARCHAR(500);
    PRINT 'Da them cot VideoUrl vao bang Workouts';
END
GO

-- Kiểm tra và thêm cột Image cho bảng Meals (nếu chưa có) để hiển thị ảnh món ăn
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Meals') AND name = 'Image')
BEGIN
    ALTER TABLE Meals ADD Image NVARCHAR(500);
    PRINT 'Da them cot Image vao bang Meals';
END
GO

USE [MySportCoachAI]
GO

/****** Object:  Table [dbo].[Meals]    Script Date: 12/7/2025 12:00:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- 1. DROP TABLe IF EXISTS
IF OBJECT_ID('dbo.Meals', 'U') IS NOT NULL
	DROP TABLE dbo.Meals
GO

-- 2. CREATE TABLE
CREATE TABLE [dbo].[Meals](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Kcal] [int] NOT NULL,
	[Protein] [float] NOT NULL,
	[Carb] [float] NOT NULL,
	[Fat] [float] NOT NULL,
	[ServingSize] [nvarchar](100) NULL,
	[SuitableSports] [nvarchar](500) NULL,
	[MealTime] [nvarchar](100) NULL,
	[Ingredients] [nvarchar](MAX) NULL,
	[Recipe] [nvarchar](MAX) NULL,
	[CookingTimeMin] [int] NULL,
	[Difficulty] [nvarchar](50) NULL,
	[Image] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- 3. SEED DATA (SAMPLE)
INSERT INTO [dbo].[Meals] 
([Name], [Kcal], [Protein], [Carb], [Fat], [ServingSize], [SuitableSports], [MealTime], [Ingredients], [Recipe], [CookingTimeMin], [Difficulty], [Image])
VALUES
(N'Ức gà áp chảo sốt chanh dây', 320, 45, 12, 8.5, N'1 đĩa (200g gà)', N'Gym, Bodybuilding', N'Lunch, Dinner', N'200g ức gà, chanh dây, mật ong', N'Áp chảo và rưới sốt', 20, N'Easy', NULL),
(N'Sinh tố chuối yến mạch', 280, 12, 45, 6, N'1 ly (350ml)', N'Running, Cardio', N'Pre-Workout, Breakfast', N'Chuối, yến mạch, sữa', N'Xay nhuyễn', 5, N'Easy', NULL),
(N'Cơm gạo lứt bò xào bông cải', 450, 38, 50, 12, N'1 phần', N'Gym, Football', N'Lunch', N'Bò, bông cải, gạo lứt', N'Xào chín', 25, N'Medium', NULL),
(N'Salad cá hồi bơ', 410, 35, 10, 25, N'1 tô lớn', N'Yoga, Pilates', N'Lunch, Dinner', N'Cá hồi, bơ, rau', N'Trộn đều', 15, N'Medium', NULL),
(N'Sữa chua Hy Lạp mix hạt', 180, 15, 12, 8, N'1 hũ', N'All', N'Snack', N'Sữa chua, hạt', N'Ăn liền', 2, N'Easy', NULL);
GO

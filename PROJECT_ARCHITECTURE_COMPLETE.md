# 📋 TÀI LIỆU KIẾN TRÚC DỰ ÁN MYSPORTCOACH AI - ĐẦY ĐỦ VÀ CHI TIẾT

## 🎯 TỔNG QUAN DỰ ÁN

**Tên dự án:** MySportCoach AI  
**Loại ứng dụng:** Web Application (Full-stack)  
**Mô tả:** Hệ thống AI Coach thể thao và dinh dưỡng, cung cấp lịch trình tập luyện và ăn uống cá nhân hóa, chatbot AI thông minh, mạng xã hội thể thao, bảng xếp hạng và quản trị admin.

**Mục tiêu chính:**
- Tạo lịch trình tập luyện và dinh dưỡng tự động dựa trên profile user
- Chatbot AI hỗ trợ tư vấn thể thao, dinh dưỡng, thời tiết
- Hệ thống social media (posts, comments, likes, messages)
- Leaderboard và gamification (points, achievements, streaks)
- Admin panel quản lý users, meals, workouts, posts

---

## 🏗️ KIẾN TRÚC TỔNG QUAN

### 1. Architecture Pattern
- **Frontend:** React SPA (Single Page Application) với React Router
- **Backend:** RESTful API với Flask (Python)
- **Database:** Microsoft SQL Server (mssql+pyodbc)
- **AI/Chatbot:** PyTorch Neural Network (Intent-based chatbot)

### 2. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                    │
│  React App (Vite) - Port 5173/5174                          │
│  - Components, Pages, Contexts                              │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST (CORS enabled)
┌───────────────────────▼─────────────────────────────────────┐
│                 API GATEWAY LAYER                            │
│  Flask Application - Port 5000                               │
│  - Blueprints (Modular routes)                              │
│  - Session Management (Flask-Session)                       │
│  - CORS Middleware                                          │
└───────┬──────────────┬──────────────┬───────────────────────┘
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼─────────┐
│ Business     │ │ Services   │ │ Models       │
│ Logic        │ │ Layer      │ │ (ORM)        │
│ (API Routes) │ │            │ │              │
└───────┬──────┘ └─────┬──────┘ └────┬─────────┘
        │              │              │
        │              │              │
┌───────▼──────────────▼──────────────▼──────────────┐
│           DATA ACCESS LAYER                         │
│  SQLAlchemy ORM → SQL Server Database               │
│  - Users, Meals, Workouts, UserPlans, etc.         │
└─────────────────────────────────────────────────────┘
```

---

## 💻 CÔNG NGHỆ STACK

### Backend Technologies
| Component | Technology | Version | Mục đích |
|-----------|-----------|---------|----------|
| Framework | Flask | Latest | Web framework |
| ORM | SQLAlchemy | Latest | Database abstraction |
| Database Driver | pyodbc | Latest | SQL Server connectivity |
| Session | Flask-Session | Latest | Server-side sessions |
| CORS | Flask-CORS | Latest | Cross-origin requests |
| Email | Flask-Mail | Latest | Email notifications |
| AI/ML | PyTorch | Latest | Neural network chatbot |
| NLP | NLTK | Latest | Text processing (tokenize, stem) |
| Async Tasks | Threading | Built-in | Email sending |

### Frontend Technologies
| Component | Technology | Version | Mục đích |
|-----------|-----------|---------|----------|
| Framework | React | 19.0.0 | UI framework |
| Router | React Router DOM | 7.1.3 | Client-side routing |
| Build Tool | Vite | 5.4.10 | Fast build tool |
| UI Animations | Framer Motion | 12.0.0 | Animations |
| Icons | Lucide React | 0.454.0 | Icon library |
| CSS | Tailwind CSS | 3.4.14 | Utility-first CSS |
| State Management | React Hooks | Built-in | useState, useEffect, useContext |

### Database
- **Type:** Microsoft SQL Server (Express/local)
- **Connection String:** `mssql+pyodbc://sa:123@MSI\SQLEXPRESS01/MySportCoachAI?driver=ODBC+Driver+17+for+SQL+Server&charset=utf8`
- **Encoding:** UTF-8 (Unicode support for Vietnamese)

### External APIs
- **Weather API:** OpenWeatherMap (API Key: 40dfa2d8e73afabb299edc21486cb2c3)
- **Email:** SMTP Gmail (trantruongthanh04@gmail.com)

---

## 📁 CẤU TRÚC THƯ MỤC CHI TIẾT

```
CodeDoanCap1/
├── my-frontend/
│   ├── BACKEND/                          # Flask Backend
│   │   ├── app.py                        # Flask app entry point
│   │   ├── db.py                         # SQLAlchemy db instance
│   │   │
│   │   ├── api/                          # API Routes (Blueprints)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                   # Authentication endpoints
│   │   │   ├── profile.py                # User profile management
│   │   │   ├── planner.py                # Planner endpoints
│   │   │   ├── ai_coach.py               # AI schedule & swap
│   │   │   ├── chatbot_local.py          # Chatbot endpoints
│   │   │   ├── smart_swap.py             # Smart swap suggestions
│   │   │   ├── meals.py                  # Meals CRUD
│   │   │   ├── newsfeed.py               # NewsFeed endpoints
│   │   │   ├── social.py                 # Social features (posts, comments, messages)
│   │   │   ├── leaderboard_new.py        # Leaderboard & points system
│   │   │   ├── notifications.py          # Notifications
│   │   │   ├── settings.py               # User settings
│   │   │   ├── upload.py                 # File upload
│   │   │   ├── diary.py                  # Diary/history
│   │   │   ├── weather.py                # Weather API wrapper
│   │   │   ├── videos.py                 # Video endpoints
│   │   │   ├── logs.py                   # Activity logs
│   │   │   ├── schedule_manager.py       # Work schedule management
│   │   │   │
│   │   │   └── routes/
│   │   │       └── admin_routes/         # Admin Panel APIs
│   │   │           ├── admin_middleware.py
│   │   │           ├── dashboard_admin.py
│   │   │           ├── users_admin.py
│   │   │           ├── meals_admin_api.py
│   │   │           ├── workouts_admin_api.py
│   │   │           ├── posts_admin_api.py
│   │   │           ├── feedback.py
│   │   │           ├── settings_admin_api.py
│   │   │           └── accounts.py
│   │   │
│   │   ├── models/                       # SQLAlchemy Models
│   │   │   ├── __init__.py
│   │   │   ├── user_model.py             # User model
│   │   │   ├── account_model.py          # Account (authentication)
│   │   │   ├── meal.py                   # Meal model
│   │   │   ├── workout.py                # Workout model (26 columns)
│   │   │   ├── user_plan.py              # UserPlans (scheduled items)
│   │   │   ├── user_schedule.py          # UserSchedule (busy slots)
│   │   │   ├── post.py                   # Posts model
│   │   │   ├── social_models.py          # Comment, Like, Share, Conversation, Message
│   │   │   ├── leaderboard_models.py     # WorkoutLog, UserStats, Achievement
│   │   │   ├── chat_history.py           # ChatHistory
│   │   │   ├── feedback.py               # Feedback model
│   │   │   ├── log.py                    # Log (user feedback)
│   │   │   ├── notification_log.py       # NotificationLog
│   │   │   ├── pending_registration.py   # PendingRegistration (OTP)
│   │   │   └── system_setting.py         # SystemSetting
│   │   │
│   │   ├── services/                     # Business Logic Services
│   │   │   ├── recommendation_service.py # SmartRecommendationEngine
│   │   │   ├── email_service.py          # Email sending (Flask-Mail)
│   │   │   ├── user_service.py           # User business logic
│   │   │   └── scheduler.py              # Background tasks
│   │   │
│   │   ├── chatbot_core/                 # AI Chatbot System
│   │   │   ├── model.py                  # PyTorch NeuralNet model
│   │   │   ├── nltk_utils.py             # Tokenize, stem, bag_of_words
│   │   │   ├── chat_service.py           # Main chatbot logic
│   │   │   ├── weather_handler.py        # Weather query handler
│   │   │   ├── train_super.py            # Training script (3072 neurons)
│   │   │   ├── train_now.py              # Quick training script
│   │   │   ├── check_training.py         # Training status checker
│   │   │   ├── data.pth                  # Trained model weights
│   │   │   └── data/
│   │   │       ├── intents_mega.json     # Training data (500k+ patterns)
│   │   │       ├── intents.json          # Base intents
│   │   │       └── ... (other intent files)
│   │   │
│   │   ├── utils/                        # Utilities
│   │   │   ├── logger.py                 # Logging setup
│   │   │   └── scheduler.py              # Background scheduler
│   │   │
│   │   ├── migrations/                   # Database migrations
│   │   │   ├── *.sql files
│   │   │   └── *.py migration scripts
│   │   │
│   │   ├── maintenance_scripts/          # Maintenance utilities
│   │   │   └── *.py scripts
│   │   │
│   │   └── static/uploads/               # Uploaded files
│   │
│   └── FRONTEND/                         # React Frontend
│       ├── main.jsx                      # Entry point
│       ├── App.jsx                       # Root component (Routes)
│       ├── App.css                       # Global styles
│       ├── index.css                     # Base styles
│       ├── config.js                     # API configuration
│       │
│       ├── pages/                        # Page Components
│       │   ├── Home.jsx                  # Home page
│       │   ├── Login.jsx                 # Login page
│       │   ├── Register.jsx              # Registration
│       │   ├── ForgotPassword.jsx        # Password reset
│       │   ├── Planner.jsx               # Weekly planner
│       │   ├── Profile.jsx               # User profile
│       │   ├── Leaderboard.jsx           # Leaderboard page
│       │   ├── Social.jsx                # Social feed
│       │   ├── NewsFeed.jsx              # NewsFeed
│       │   ├── Settings.jsx              # User settings
│       │   ├── Logs.jsx                  # Activity logs
│       │   ├── Videos.jsx                # Video library
│       │   ├── Diary.jsx                 # Diary/history
│       │   └── WorkScheduleManager.jsx   # Work schedule
│       │
│       ├── components/                   # Reusable Components
│       │   ├── Navbar.jsx                # Navigation bar
│       │   ├── Footer.jsx                # Footer
│       │   ├── ChatBox.jsx               # Chatbot UI
│       │   ├── SwapButton.jsx            # Swap meal/workout button
│       │   ├── PostCard.jsx              # Post display
│       │   ├── CreatePost.jsx            # Create post modal
│       │   ├── Messenger.jsx             # Direct messaging
│       │   ├── NotificationBell.jsx      # Notifications
│       │   ├── WeatherCard.jsx           # Weather widget
│       │   ├── Clock.jsx                 # Clock component
│       │   ├── DailyBriefingModal.jsx    # Daily briefing
│       │   ├── ImageUploader.jsx         # Image upload
│       │   └── Toast.jsx                 # Toast notifications
│       │
│       ├── admin/                        # Admin Panel
│       │   ├── pages/
│       │   │   ├── AdminLayout.jsx       # Admin layout wrapper
│       │   │   ├── AdminDashboard.jsx    # Dashboard
│       │   │   ├── AdminUsers.jsx        # User management
│       │   │   ├── AdminMeals.jsx        # Meal management
│       │   │   ├── AdminWorkouts.jsx     # Workout management
│       │   │   ├── AdminPosts.jsx        # Post moderation
│       │   │   ├── AdminFeedback.jsx     # Feedback management
│       │   │   └── AdminSettings.jsx     # System settings
│       │   └── components/
│       │       └── ProtectedRoute.jsx    # Admin route guard
│       │
│       ├── contexts/                     # React Contexts
│       │   └── ToastContext.jsx          # Toast notifications
│       │
│       └── assets/                       # Static assets
│           └── home_background.jpg
│
├── vite.config.js                        # Vite configuration
├── package.json                          # Frontend dependencies
└── README.md
```

---

## 🗄️ DATABASE SCHEMA CHI TIẾT

### Core Tables

#### 1. Users (User Model)
| Column | Type | Description |
|--------|------|-------------|
| Id | INTEGER (PK) | Primary key |
| Name | NVARCHAR(100) | User full name |
| Email | VARCHAR(100) UNIQUE | Email (unique) |
| Age | INTEGER | Age |
| Sex | NVARCHAR(10) | Gender (Nam/Nữ) |
| Height_cm | INTEGER | Height in cm |
| Weight_kg | INTEGER | Weight in kg |
| Sport | NVARCHAR(50) | Favorite sport (dropdown) |
| Goal | NVARCHAR(50) | Fitness goal (Tăng cơ/Giảm cân/Giữ dáng) |
| Sessions_per_week | INTEGER | Training sessions per week |
| Allergies | NVARCHAR(500) | Food allergies (JSON array) |
| DislikedIngredients | NVARCHAR(MAX) | Disliked ingredients (JSON) |
| WorkSchedule | NVARCHAR(MAX) | Work schedule (JSON) |
| Avatar | TEXT | Avatar image URL |
| Bio | NVARCHAR(MAX) | Bio/description |
| Preferences | TEXT | User preferences (JSON) |
| Privacy | TEXT | Privacy settings (JSON) |
| NotificationSettings | TEXT | Notification preferences (JSON) |
| CreatedAt | DATETIME | Account creation timestamp |

#### 2. accounts (Account Model)
| Column | Type | Description |
|--------|------|-------------|
| Id | INTEGER (PK) | Primary key |
| Email | VARCHAR(100) UNIQUE | Email (unique, for login) |
| Password | VARCHAR(100) | Password (plain text - NOT SECURE, should hash) |
| Role | VARCHAR(20) | Role: 'user' or 'admin' |
| User_id | INTEGER (FK → Users.Id) | Foreign key to Users |
| ResetToken | VARCHAR(6) | OTP token for password reset |
| ResetTokenExpiry | DATETIME | Token expiry |
| CreatedAt | DATETIME | Account creation |

#### 3. Meals (Meal Model)
| Column | Type | Description |
|--------|------|-------------|
| Id | INTEGER (PK) | Primary key |
| Name | VARCHAR(255) | Meal name |
| Kcal | INTEGER | Calories |
| Protein | FLOAT | Protein (g) |
| Carb | FLOAT | Carbohydrates (g) |
| Fat | FLOAT | Fat (g) |
| ServingSize | VARCHAR(100) | Serving size (e.g., "100g") |
| SuitableSports | VARCHAR(500) | Comma-separated sports (e.g., "Gym, Yoga") |
| MealTime | VARCHAR(100) | Breakfast/Lunch/Dinner |
| Ingredients | TEXT | Ingredients list |
| Recipe | TEXT | Cooking instructions |
| CookingTimeMin | INTEGER | Cooking time (minutes) |
| Difficulty | VARCHAR(50) | Easy/Medium/Hard |
| Image | VARCHAR(500) | Image URL |

#### 4. Workouts (Workout Model) - 26 COLUMNS
**Core Info (11 columns):**
- Id (PK), Name, Sport, Duration_min, MuscleGroups, Intensity, Equipment, Difficulty, GoalFocus, CalorieBurn, VideoUrl

**Workout Details (3 columns):**
- Sets, Reps, RestTime

**Descriptions (3 columns):**
- Description, Instructions, SafetyNotes

**AI & Goals (2 columns):**
- AITags, Goals

**Metadata (3 columns):**
- CreatedAt, UpdatedAt, IsActive

**Progression (2 columns):**
- ProgressionNotes, RegressionNotes

**Muscle Details (2 columns):**
- PrimaryMuscles, SecondaryMuscles

**Prerequisites (1 column):**
- Prerequisites

#### 5. UserPlans (UserPlan Model)
| Column | Type | Description |
|--------|------|-------------|
| Id | INTEGER (PK) | Primary key |
| UserId | INTEGER (FK → Users.Id) | User ID |
| Date | DATE | Plan date |
| Slot | VARCHAR(50) | Time slot: "morning", "afternoon", "evening" |
| Type | VARCHAR(20) | "meal" or "workout" |
| MealId | INTEGER (FK → Meals.Id) | Meal ID (if Type=meal) |
| WorkoutId | INTEGER (FK → Workouts.Id) | Workout ID (if Type=workout) |
| ProfileHash | VARCHAR(32) | MD5 hash of user profile (for regeneration check) |
| IsCompleted | BOOLEAN | Completion status |
| CreatedAt | DATETIME | Creation timestamp |

#### 6. UserSchedule (UserSchedule Model)
| Column | Type | Description |
|--------|------|-------------|
| Id | INTEGER (PK) | Primary key |
| User_id | INTEGER (FK → Users.Id) | User ID |
| DayOfWeek | NVARCHAR(10) | "mon", "tue", "wed", etc. |
| Period | NVARCHAR(10) | "morning", "afternoon", "evening" |
| Note | NVARCHAR(200) | Busy reason/description |
| Date | DATE | Specific date (if one-time) |
| MealId | INTEGER (FK → Meals.Id) | Optional meal |
| WorkoutId | INTEGER (FK → Workouts.Id) | Optional workout |
| Time | TIME | Specific time |
| IsNotified | BOOLEAN | Notification sent flag |
| CreatedAt | DATETIME | Creation timestamp |

#### 7. SocialPosts (Post Model - Social)
| Column | Type | Description |
|--------|------|-------------|
| Id | INTEGER (PK) | Primary key |
| User_id | INTEGER (FK → Users.Id) | Author ID |
| Content | NVARCHAR(MAX) | Post content |
| Title | NVARCHAR(255) | Post title |
| Sport | NVARCHAR(50) | Related sport |
| Topic | NVARCHAR(50) | Topic/category |
| ImageUrl | NVARCHAR(MAX) | Image URL/base64 |
| Status | NVARCHAR(20) | Pending/Approved/Rejected |
| CreatedAt | DATETIME | Creation timestamp |
| UpdatedAt | DATETIME | Last update |

**Related Tables:**
- Comments (Id, Post_id, User_id, Content, CreatedAt)
- Likes (Id, Post_id, User_id, CreatedAt) - UNIQUE(Post_id, User_id)
- Shares (Id, Post_id, User_id, CreatedAt)

#### 8. Conversations & Messages
- Conversations (Id, User1_id, User2_id, LastMessageAt)
- Messages (Id, Conversation_id, Sender_id, Content, IsRead, CreatedAt)

#### 9. Leaderboard System
- WorkoutLogs (Id, User_id, Workout_name, Sport, Duration_minutes, Calories_burned, Difficulty, Completed_at, Points_earned)
- UserStats (Id, User_id, Total_points, Total_workouts, Current_streak, Longest_streak, Last_workout_date, Level, Experience, Rank, Updated_at)
- Achievements (Id, Name, Description, Icon, Points_reward, Requirement_type, Requirement_value)
- UserAchievements (Id, User_id, Achievement_id, Unlocked_at) - UNIQUE(User_id, Achievement_id)

#### 10. Other Tables
- Posts (Id, User_id, Content, Image, Status, ApprovedBy, ApprovedAt, RejectionReason, CreatedAt, UpdatedAt, Likes, Comments)
- ChatHistory (Id, User_id, Message, Response, Timestamp)
- Log (Id, User_id, Meal_id, Workout_id, Rating, FeedbackType, CreatedAt)
- Feedback (Id, User_id, Type, Content, Status, CreatedAt)
- NotificationLog (Id, User_id, Type, Content, IsRead, CreatedAt)
- PendingRegistration (Id, Email, Password, Name, OTP, OTPExpiry)

---

## 🔌 API ENDPOINTS ĐẦY ĐỦ

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/register` | Register new user | {email, password, confirmPassword, name} | {success, message, email} |
| POST | `/verify-register-otp` | Verify OTP | {email, otp} | {success, message, user_id} |
| POST | `/login` | Login | {email, password} | {success, user_id, role, name, email, avatar} |
| POST | `/logout` | Logout | - | {success, message} |
| GET | `/me` | Get current user | - | {success, user_id, name, email, avatar, role} |
| POST | `/forgot-password` | Request password reset | {email} | {success, message, email} |
| POST | `/verify-otp` | Verify OTP for reset | {email, otp} | {success, message, email} |
| POST | `/reset-password` | Reset password | {email, otp, newPassword, confirmPassword} | {success, message} |

### Profile (`/api/profile`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `` | Get user profile |
| POST | `/<user_id>` | Update profile |
| GET | `/schedule` | Get work schedule |
| POST | `/schedule` | Update work schedule |

### AI Coach (`/api/ai`)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/schedule` | Get daily schedule | ?user_id=&date=YYYY-MM-DD |
| POST | `/feedback` | Submit feedback | {user_id, meal_id?, workout_id?, rating, feedback_type} |
| POST | `/swap` | Swap meal/workout | {user_id, date, old_item_id, new_item_id, type, slot?} |
| POST | `/regenerate` | Regenerate schedule | {date} |

### Chatbot (`/api/bot`)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/chat` | Chat with AI | {message, user_id?} |
| GET | `/chat/history` | Get chat history | - |
| DELETE | `/chat/history/clear` | Clear history | - |

### Smart Swap (`/api/smart-swap`)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/suggest-meal` | Get meal alternatives | {user_id, current_meal_id, time_slot} |
| POST | `/suggest-workout` | Get workout alternatives | {user_id, current_workout_id} |

### Planner (`/api/planner`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get meals and workouts list |

### Meals (`/api/meals`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all meals |
| GET | `/workouts` | Get meals and workouts |

### Social (`/api/social`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | Get posts (paginated, filtered) |
| POST | `/posts` | Create post |
| DELETE | `/posts/<post_id>` | Delete post |
| GET | `/posts/<post_id>/comments` | Get comments |
| POST | `/posts/<post_id>/comments` | Add comment |
| POST | `/posts/<post_id>/like` | Toggle like |
| POST | `/posts/<post_id>/share` | Share post |
| GET | `/conversations` | Get conversations |
| GET | `/conversations/<user2_id>` | Get/create conversation |
| POST | `/conversations/<conversation_id>/messages` | Send message |
| GET | `/users/search` | Search users |

### Leaderboard (`/api/leaderboard-new`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/log-workout` | Log completed workout |
| GET | `/my-workouts` | Get user's workout logs |
| POST | `/complete-schedule-item` | Complete schedule item |
| GET | `/rankings` | Get leaderboard rankings |
| GET | `/my-stats` | Get user stats |
| GET | `/achievements` | Get user achievements |
| GET | `/stats/overview` | Get stats overview |

### NewsFeed (`/api/newsfeed`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get approved posts |
| POST | `/create` | Create post |
| POST | `/like` | Like post |

### Schedule Manager (`/api/schedule`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/busy` | Get busy slots |
| POST | `/busy` | Add busy slot |

### Settings (`/api/settings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `` | Get user settings |
| POST | `` | Update settings |
| GET | `/export` | Export user data |
| POST | `/reset` | Reset settings |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get notifications |

### Upload (`/api/upload`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload file (image) |

### Diary (`/api/diary`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/history` | Get diary history |
| GET | `/preferences` | Get user preferences |
| POST | `/remove-preference` | Remove preference |

### Admin Endpoints (`/api/admin`)
**Users:**
- GET `/users` - List users (paginated, filtered)
- GET `/users/stats` - User statistics
- PUT `/users/<user_id>` - Update user
- DELETE `/users/<user_id>` - Delete user (cascade)
- GET `/filters/sports` - Get sports filter
- GET `/filters/goals` - Get goals filter

**Meals:**
- GET `/meals` - List meals
- POST `/meals` - Create meal
- PUT `/meals/<meal_id>` - Update meal
- DELETE `/meals/<meal_id>` - Delete meal
- GET `/meals/stats` - Meal statistics
- GET `/meals/filters/sports` - Sports filter
- GET `/meals/filters/meal-types` - Meal types filter

**Workouts:**
- GET `/workouts` - List workouts
- GET `/workouts/<workout_id>` - Get workout
- POST `/workouts` - Create workout
- PUT `/workouts/<workout_id>` - Update workout
- DELETE `/workouts/<workout_id>` - Soft delete
- DELETE `/workouts/<workout_id>/hard-delete` - Hard delete
- GET `/workouts/stats` - Workout statistics
- GET `/workouts/filters/sports` - Sports filter
- GET `/workouts/filters/difficulties` - Difficulties filter

**Posts:**
- GET `/posts` - List posts (with status filter)
- POST `/posts/<post_id>/approve` - Approve post
- POST `/posts/<post_id>/reject` - Reject post
- DELETE `/posts/<post_id>` - Delete post
- GET `/posts/stats` - Post statistics
- POST `/posts/bulk-action` - Bulk approve/reject

**Dashboard:**
- GET `/dashboard/stats` - Overall statistics
- GET `/dashboard/user-growth` - User growth data

**Feedback:**
- GET `/feedback` - List feedback
- POST `/feedback/<feedback_id>/resolve` - Resolve feedback
- DELETE `/feedback/<feedback_id>` - Delete feedback
- GET `/feedback/stats` - Feedback statistics

**Settings:**
- GET `/settings` - Get system settings
- POST `/settings` - Update settings
- POST `/settings/clear-cache` - Clear cache
- POST `/settings/backup` - Backup data

---

## 🧠 AI CHATBOT SYSTEM

### Architecture
```
User Message
    ↓
Tokenize (NLTK)
    ↓
Bag of Words Vector
    ↓
Neural Network (PyTorch)
    ↓
Intent Classification (Tags)
    ↓
Response Selection
    ↓
Context Handler (Schedule, Stats, Weather)
    ↓
Formatted Response
```

### Model Details
- **Architecture:** 3-layer feedforward neural network
  - Input Layer: Vocabulary size (varies, ~1000-5000 words)
  - Hidden Layer 1: 3072 neurons (ReLU activation)
  - Hidden Layer 2: 3072 neurons (ReLU activation)
  - Output Layer: Number of intent tags (~100-500 tags)

- **Training Configuration:**
  - Epochs: 400
  - Batch Size: 512
  - Learning Rate: 0.0005
  - Optimizer: Adam
  - Loss Function: CrossEntropyLoss

- **Training Data:**
  - File: `intents_mega.json`
  - Patterns: 500,000+ training patterns
  - Intents: Sports, nutrition, schedule, weather, greeting, motivation, etc.

### Intent Handlers
- `schedule` - Check today's schedule
- `busy_schedule` - Check busy slots
- `stats` - User statistics
- `my_info` - User information
- `my_body` - Body measurements (BMI)
- `my_sport` - Sport and goal
- `calc_tdee` - Calculate TDEE
- `calc_bmi` - Calculate BMI
- `weather_query` - Weather forecast (OpenWeatherMap API)
- `greeting` - Greetings
- `motivation` - Motivational quotes
- `suggest_meal` - Meal suggestions
- `suggest_workout` - Workout suggestions
- `small_talk` - Casual conversation

### Response Flow
1. User sends message → `POST /api/bot/chat`
2. Tokenize message using NLTK
3. Convert to Bag of Words vector
4. Feed to trained PyTorch model
5. Get intent tag with probability
6. If probability > 0.75:
   - Call intent-specific handler (e.g., `handle_schedule_query`)
   - Handler queries database or calls external API
   - Returns formatted response
7. Save to ChatHistory
8. Return response to user

---

## 🔄 SMART RECOMMENDATION ENGINE

### Algorithm: SmartRecommendationEngine
**Location:** `services/recommendation_service.py`

### Process Flow
```
1. User requests schedule for date
   ↓
2. Check if schedule exists in UserPlans
   ↓
3. Check if user profile changed (ProfileHash)
   ↓
4. If exists & profile unchanged → Return cached schedule
   ↓
5. If not exists or profile changed:
   a. Get user profile (Sport, Goal, Allergies, DislikedIngredients)
   b. Get busy slots from UserSchedule
   c. Filter meals by:
      - MealTime (Breakfast/Lunch/Dinner)
      - SuitableSports
      - Allergies/Dislikes
   d. Filter workouts by:
      - Sport matching
      - AITags
      - Goals
   e. Score each candidate (meal/workout)
      - Base score: 50
      - Sport match: +50
      - Goal match: +30
      - Liked items: +50
      - Disliked items: -1000 (exclude)
      - Random variation: ±5-10
   f. Select top 5, randomly pick one
   ↓
6. Save to UserPlans with ProfileHash
   ↓
7. Return schedule
```

### Scoring Function
**Meal Scoring:**
- Allergy/dislike check: -1000 (exclude)
- Liked meals: +50
- Sport match: +20
- Goal match: +30 (e.g., high protein for muscle gain)
- Random: ±10

**Workout Scoring:**
- Disliked workouts: -1000
- Liked workouts: +50
- Sport match: +50
- Goal match: +30
- Difficulty matching: ±20
- Random: ±5

---

## 🎨 FRONTEND COMPONENTS

### Page Components
1. **Home** - Landing page with clock, weather, chatbot
2. **Login** - Login form
3. **Register** - Registration with OTP verification
4. **ForgotPassword** - Password reset flow
5. **Planner** - Weekly schedule view (7 days)
6. **Profile** - User profile editing
7. **Leaderboard** - Rankings and stats
8. **Social** - Social feed
9. **NewsFeed** - Approved posts feed
10. **Settings** - User settings
11. **Logs** - Activity history
12. **Videos** - Video library
13. **Diary** - Diary/history
14. **WorkScheduleManager** - Manage busy slots

### Reusable Components
1. **Navbar** - Navigation with user menu
2. **Footer** - Footer
3. **ChatBox** - Floating chatbot UI
4. **SwapButton** - Swap meal/workout button with suggestions
5. **PostCard** - Display post with like/comment
6. **CreatePost** - Modal to create post
7. **Messenger** - Direct messaging UI
8. **NotificationBell** - Notifications dropdown
9. **WeatherCard** - Weather widget
10. **Clock** - Real-time clock
11. **DailyBriefingModal** - Daily summary modal
12. **ImageUploader** - Image upload component
13. **Toast** - Toast notifications

### Admin Components
1. **AdminLayout** - Admin wrapper with sidebar
2. **AdminDashboard** - Dashboard with stats
3. **AdminUsers** - User management table
4. **AdminMeals** - Meal CRUD
5. **AdminWorkouts** - Workout CRUD (26 fields)
6. **AdminPosts** - Post moderation
7. **AdminFeedback** - Feedback management
8. **AdminSettings** - System settings

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Session Management
- **Backend:** Flask-Session (server-side, filesystem)
- **Lifetime:** 1 day (24 hours)
- **Session Keys:**
  - `user_id` - User ID
  - `account_id` - Account ID
  - `role` - User role (user/admin)

### Password Security
⚠️ **CURRENTLY INSECURE:** Passwords stored as plain text in database.  
**Should implement:** Password hashing (bcrypt/argon2)

### OTP System
- **Purpose:** Registration verification & password reset
- **Format:** 6-digit numeric code
- **Expiry:** 10 minutes
- **Storage:** `PendingRegistration` table (registration) or `accounts.ResetToken` (password reset)

### Admin Authorization
- **Middleware:** `admin_middleware.require_admin()`
- **Check:** `session.get('role') == 'admin'`
- **Routes:** All `/api/admin/*` endpoints

---

## 📧 EMAIL SYSTEM

### Email Service
**Service:** Flask-Mail  
**Provider:** SMTP Gmail  
**Account:** trantruongthanh04@gmail.com  
**Port:** 587 (TLS)

### Email Types
1. **OTP Email** - Registration/Password reset
2. **Welcome Email** - After successful registration
3. **Schedule Reminder** - Workout/meal reminders

### Async Sending
- Uses Python `Threading` for async email sending
- Non-blocking API responses

---

## 🔄 WORKFLOWS CHI TIẾT

### 1. User Registration Flow
```
1. User fills form (email, password, name)
   ↓
2. POST /api/auth/register
   ↓
3. Validate email format & password strength
   ↓
4. Check if email exists
   ↓
5. Generate 6-digit OTP
   ↓
6. Save to PendingRegistration (expiry 10 min)
   ↓
7. Send OTP email (async)
   ↓
8. User enters OTP
   ↓
9. POST /api/auth/verify-register-otp
   ↓
10. Verify OTP & expiry
   ↓
11. Create User record
   ↓
12. Create Account record (role='user')
   ↓
13. Send welcome email (async)
   ↓
14. Return success
```

### 2. Schedule Generation Flow
```
1. User opens Planner page
   ↓
2. Frontend: Fetch schedule for 7 days (Monday-Sunday)
   ↓
3. GET /api/ai/schedule?user_id=X&date=YYYY-MM-DD
   ↓
4. Backend: Check UserPlans for date
   ↓
5. If exists & ProfileHash matches → Return cached
   ↓
6. If not exists or profile changed:
   a. Create SmartRecommendationEngine(user_id, date)
   b. Get user profile (Sport, Goal, Allergies)
   c. Get busy slots from UserSchedule
   d. Generate meals for morning/afternoon/evening
   e. Generate workouts (avoid busy slots)
   f. Score & select best matches
   g. Save to UserPlans
   ↓
7. Return schedule JSON
   ↓
8. Frontend: Display in weekly grid
```

### 3. Swap Meal/Workout Flow
```
1. User clicks SwapButton on meal/workout
   ↓
2. Frontend: Show loading
   ↓
3. POST /api/smart-swap/suggest-meal (or suggest-workout)
   - Send: {user_id, current_meal_id, time_slot}
   ↓
4. Backend: Query alternatives
   - Filter by calorie range (±100)
   - Score by: calories, protein, sport, time slot
   ↓
5. Return top 5 suggestions
   ↓
6. Frontend: Display suggestions in modal
   ↓
7. User selects alternative
   ↓
8. POST /api/ai/swap
   - Send: {user_id, date, old_item_id, new_item_id, type, slot}
   ↓
9. Backend: Update UserPlan.MealId or WorkoutId
   ↓
10. Return success + new item data
   ↓
11. Frontend: Update UI
```

### 4. Chatbot Interaction Flow
```
1. User types message in ChatBox
   ↓
2. POST /api/bot/chat {message, user_id}
   ↓
3. Backend: Get user context (name, sport, goal, etc.)
   ↓
4. chat_service.get_response(message, user_context)
   ↓
5. Tokenize message (NLTK)
   ↓
6. Convert to Bag of Words
   ↓
7. Feed to PyTorch model
   ↓
8. Get intent tag + probability
   ↓
9. If probability > 0.75:
   - Call intent handler (e.g., handle_schedule_query)
   - Handler queries DB or external API
   - Return formatted response
   Else:
   - Return default "not understood" message
   ↓
10. Save to ChatHistory (async)
   ↓
11. Return response
   ↓
12. Frontend: Display in chat UI
```

### 5. Post Creation & Moderation Flow
```
1. User creates post in Social/NewsFeed
   ↓
2. POST /api/social/posts {content, image_url, title, sport, topic}
   ↓
3. Backend: Create Post record (Status='Pending')
   ↓
4. Return success message "Chờ admin duyệt"
   ↓
5. Admin opens AdminPosts
   ↓
6. GET /api/admin/posts?status=Pending
   ↓
7. Display pending posts
   ↓
8. Admin approves/rejects
   ↓
9. POST /api/admin/posts/<id>/approve (or /reject)
   ↓
10. Update Post.Status to 'Approved' or 'Rejected'
   ↓
11. If approved → Post appears in Social feed
```

---

## ⚙️ CONFIGURATION

### Backend Configuration (`app.py`)
```python
SQLALCHEMY_DATABASE_URI = 'mssql+pyodbc://sa:123@MSI\\SQLEXPRESS01/MySportCoachAI?driver=ODBC+Driver+17+for+SQL+Server&charset=utf8'
SECRET_KEY = 'my_secret_key'
SESSION_TYPE = 'filesystem'
PERMANENT_SESSION_LIFETIME = timedelta(days=1)
CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://192.168.1.111:5173']

MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = 'trantruongthanh04@gmail.com'
MAIL_PASSWORD = 'isqr gucl buaq yoyh'
```

### Frontend Configuration (`vite.config.js`)
```javascript
server: {
  host: true,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (Should Implement)
- Model tests (CRUD operations)
- Service tests (recommendation engine, scoring)
- Chatbot tests (intent classification)

### Integration Tests (Should Implement)
- API endpoint tests
- Authentication flow tests
- Schedule generation tests

### E2E Tests (Should Implement)
- User registration → Login → Create schedule
- Post creation → Admin approval → Display
- Chatbot conversation flows

### Manual Testing Checklist
- [ ] User registration with OTP
- [ ] Login/logout
- [ ] Profile update
- [ ] Schedule generation
- [ ] Meal/workout swap
- [ ] Chatbot interactions
- [ ] Post creation & moderation
- [ ] Leaderboard points
- [ ] Admin CRUD operations

---

## 🏛️ ARCHITECTURE DIAGRAMS

### Module View (Decomposition)

```
MySportCoach AI System
│
├── Frontend Module (React)
│   ├── UI Components
│   ├── State Management (Hooks/Context)
│   ├── API Client (Fetch)
│   └── Routing (React Router)
│
├── Backend Module (Flask)
│   ├── API Layer (Blueprints)
│   │   ├── Auth Blueprint
│   │   ├── Profile Blueprint
│   │   ├── AI Coach Blueprint
│   │   ├── Chatbot Blueprint
│   │   ├── Social Blueprint
│   │   ├── Admin Blueprints
│   │   └── Utility Blueprints
│   │
│   ├── Business Logic Layer (Services)
│   │   ├── RecommendationService
│   │   ├── EmailService
│   │   ├── UserService
│   │   └── SchedulerService
│   │
│   ├── Data Access Layer (Models)
│   │   ├── User Models
│   │   ├── Meal/Workout Models
│   │   ├── Social Models
│   │   └── System Models
│   │
│   └── AI Module (Chatbot Core)
│       ├── Neural Network Model
│       ├── NLP Utils (NLTK)
│       ├── Intent Handlers
│       └── Training Scripts
│
└── Database Module (SQL Server)
    ├── Core Tables (Users, Meals, Workouts)
    ├── Schedule Tables (UserPlans, UserSchedule)
    ├── Social Tables (Posts, Comments, Messages)
    └── System Tables (Logs, Settings)
```

### Component & Connector (C&C) View

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │ HTTP/REST
       │ (CORS)
       ▼
┌─────────────────────────────────────┐
│         Flask Application           │
│  ┌───────────────────────────────┐  │
│  │   Request Router (Blueprints) │  │
│  └───────┬───────────────────────┘  │
│          │                          │
│  ┌───────▼───────────────────────┐  │
│  │   Session Manager             │  │
│  └───────┬───────────────────────┘  │
│          │                          │
│  ┌───────▼───────────────────────┐  │
│  │   Business Logic Services     │  │
│  │   - RecommendationService     │  │
│  │   - EmailService              │  │
│  └───────┬───────────────────────┘  │
│          │                          │
│  ┌───────▼───────────────────────┐  │
│  │   Data Access (SQLAlchemy)    │  │
│  └───────┬───────────────────────┘  │
│          │                          │
│  ┌───────▼───────────────────────┐  │
│  │   AI Chatbot (PyTorch)        │  │
│  └───────┬───────────────────────┘  │
└──────────┼──────────────────────────┘
           │ SQL (pyodbc)
           ▼
┌──────────────────────┐
│   SQL Server DB      │
└──────────────────────┘
```

### Allocation View (Deployment)

```
┌─────────────────────────────────────────────┐
│           Development Machine               │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   Frontend (Vite Dev Server)         │  │
│  │   Port: 5173/5174                    │  │
│  │   - React App                        │  │
│  │   - Hot Module Replacement           │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   Backend (Flask Dev Server)         │  │
│  │   Port: 5000                         │  │
│  │   - Flask App                        │  │
│  │   - Debug Mode: ON                   │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   SQL Server Express                 │  │
│  │   Instance: MSI\SQLEXPRESS01         │  │
│  │   Database: MySportCoachAI           │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   External Services                  │  │
│  │   - OpenWeatherMap API               │  │
│  │   - Gmail SMTP                       │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Context Diagram

```
                    ┌─────────────────┐
                    │     User        │
                    │  (Web Browser)  │
                    └────────┬────────┘
                             │
                             │ HTTP/REST
                             │
                    ┌────────▼────────┐
                    │  MySportCoach   │
                    │   AI System     │
                    │                 │
                    │  ┌──────────┐  │
                    │  │ Frontend │  │
                    │  │ (React)  │  │
                    │  └────┬─────┘  │
                    │       │        │
                    │  ┌────▼─────┐  │
                    │  │ Backend  │  │
                    │  │ (Flask)  │  │
                    │  └────┬─────┘  │
                    └───────┼────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐       ┌─────▼─────┐    ┌──────▼─────┐
    │   SQL   │       │OpenWeather│    │    Gmail   │
    │ Server  │       │    API    │    │    SMTP    │
    │   DB    │       │           │    │            │
    └─────────┘       └───────────┘    └────────────┘
```

---

## 📦 DEPENDENCIES

### Backend Dependencies (requirements.txt - Should Create)
```
Flask
Flask-CORS
Flask-Session
Flask-Mail
Flask-SQLAlchemy
pyodbc
sqlalchemy
PyTorch
nltk
numpy
python-dotenv
```

### Frontend Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.3",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.454.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "vite": "^5.4.10",
    "tailwindcss": "^3.4.14"
  }
}
```

---

## 🚀 DEPLOYMENT

### Current Setup (Development)
- **Frontend:** Vite dev server (`npm run dev`)
- **Backend:** Flask dev server (`python app.py`)
- **Database:** SQL Server Express (local)

### Production Deployment (Recommended)
1. **Frontend:**
   - Build: `npm run build`
   - Deploy to: Nginx/Apache or Vercel/Netlify
   - Serve static files from `dist/`

2. **Backend:**
   - Use Gunicorn/uWSGI
   - Deploy to: AWS EC2, Heroku, or DigitalOcean
   - Set environment variables (DB connection, secrets)

3. **Database:**
   - Use managed SQL Server (Azure SQL) or PostgreSQL
   - Configure connection pooling

4. **Environment Variables:**
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `MAIL_USERNAME`, `MAIL_PASSWORD`
   - `WEATHER_API_KEY`

---

## 🔒 SECURITY CONSIDERATIONS

### Current Issues
1. ⚠️ **Passwords stored as plain text** - Should use bcrypt/argon2
2. ⚠️ **Secret key hardcoded** - Should use environment variable
3. ⚠️ **SQL injection risk** - Most queries use ORM (safe), but some raw SQL exists
4. ⚠️ **CORS wide open** - Should restrict to specific origins in production
5. ⚠️ **Session security** - Should use secure cookies in production

### Recommendations
1. Implement password hashing (bcrypt)
2. Use environment variables for secrets
3. Add input validation/sanitization
4. Implement rate limiting
5. Use HTTPS in production
6. Add CSRF protection

---

## 📊 PERFORMANCE OPTIMIZATION

### Current Optimizations
- Database query caching (UserPlans with ProfileHash)
- Async email sending (Threading)
- Batch operations for schedule generation

### Recommended Optimizations
1. Add Redis caching for frequently accessed data
2. Implement database indexing (User_id, Date, Status)
3. Add pagination for all list endpoints
4. Use lazy loading for images
5. Implement API response compression (gzip)
6. Use CDN for static assets

---

## 🐛 KNOWN ISSUES & LIMITATIONS

1. **Password Security:** Passwords not hashed
2. **Admin Middleware:** Currently disabled for testing
3. **Error Handling:** Some endpoints lack comprehensive error handling
4. **Validation:** Limited input validation in some endpoints
5. **Testing:** No automated tests
6. **Documentation:** API documentation not fully generated
7. **Internationalization:** Only Vietnamese language supported

---

## 📝 FUTURE ENHANCEMENTS

1. **Real-time Features:**
   - WebSocket for live chat
   - Real-time notifications
   - Live leaderboard updates

2. **Mobile App:**
   - React Native app
   - Push notifications

3. **Advanced AI:**
   - GPT integration for more natural conversations
   - Image recognition for food logging
   - Personalized workout video generation

4. **Social Features:**
   - Groups/Teams
   - Challenges
   - Friend system

5. **Analytics:**
   - User behavior analytics
   - Performance metrics dashboard

---

## 🎯 CONCLUSION

Đây là tài liệu kiến trúc đầy đủ và chi tiết về hệ thống MySportCoach AI. Tài liệu này cung cấp:

✅ **Tổng quan dự án** - Mục tiêu, phạm vi, công nghệ  
✅ **Kiến trúc hệ thống** - Module view, C&C view, Allocation view, Context diagram  
✅ **Database schema** - Tất cả tables và relationships  
✅ **API endpoints** - Đầy đủ routes và parameters  
✅ **Workflows** - Các luồng xử lý chính  
✅ **AI System** - Chatbot architecture và training  
✅ **Frontend/Backend** - Components và services  
✅ **Configuration** - Cấu hình và dependencies  
✅ **Deployment** - Hướng dẫn deploy  
✅ **Security & Performance** - Best practices  

Bot khác có thể sử dụng tài liệu này để:
- Hiểu rõ toàn bộ hệ thống
- Tạo test cases
- Vẽ architecture diagrams
- Implement features mới
- Debug và maintain

---

**Tài liệu được tạo:** 2025-01-XX  
**Phiên bản:** 1.0  
**Tác giả:** AI Architecture Documentation System

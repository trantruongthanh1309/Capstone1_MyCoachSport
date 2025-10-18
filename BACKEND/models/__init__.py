from db import db  # db = SQLAlchemy()
from .user_model import User
from .meal import Meal
from .workout import Workout
from .log import Log
from .account_model import Account

# Xuất ra để dùng
__all__ = ["User", "Meal", "Workout", "Log", "Account"]
import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logger(app):
    """
    Cấu hình logging cho ứng dụng Flask.
    Sử dụng RotatingFileHandler để xoay vòng file log, tránh file quá lớn.
    """
    # Tạo thư mục logs nếu chưa tồn tại
    if not os.path.exists('logs'):
        os.mkdir('logs')

    # Cấu hình format log
    formatter = logging.Formatter(
        '[%(asctime)s] {%(pathname)s:%(lineno)d} %(levelname)s - %(message)s'
    )

    # Handler ghi ra file
    file_handler = RotatingFileHandler(
        'logs/app.log', 
        maxBytes=1024 * 1024 * 10,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    # Handler ghi ra console (để debug)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG)

    # Xóa các handler cũ (nếu có) để tránh duplicate logs
    app.logger.handlers.clear()

    # Thêm handler vào logger của app
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.INFO)

    app.logger.info('Logger startup complete')

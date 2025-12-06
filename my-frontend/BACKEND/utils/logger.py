import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logger(app):
    """
    Cấu hình logging cho ứng dụng Flask.
    Sử dụng RotatingFileHandler để xoay vòng file log, tránh file quá lớn.
    """
    if not os.path.exists('logs'):
        os.mkdir('logs')

    formatter = logging.Formatter(
        '[%(asctime)s] {%(pathname)s:%(lineno)d} %(levelname)s - %(message)s'
    )

    file_handler = RotatingFileHandler(
        'logs/app.log', 
        maxBytes=1024 * 1024 * 10,
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG)

    app.logger.handlers.clear()

    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.INFO)

    app.logger.info('Logger startup complete')

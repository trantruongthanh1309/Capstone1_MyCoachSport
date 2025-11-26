import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# --- CẤU HÌNH EMAIL ---
# BẠN HÃY SỬA LẠI 2 DÒNG DƯỚI ĐÂY:
SENDER_EMAIL = "mysportcoach.ai@gmail.com" # Email giả lập, hãy thay bằng email thật
SENDER_PASSWORD = "xxxx xxxx xxxx xxxx" # App Password 16 ký tự

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def send_notification_email(to_email, subject, body):
    if "xxxx" in SENDER_PASSWORD:
        print("⚠️ Chưa cấu hình Email Password. Bỏ qua gửi mail.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = "MySportCoach AI <" + SENDER_EMAIL + ">"
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, to_email, text)
        server.quit()
        print(f"📧 Đã gửi email đến {to_email}")
        return True
    except Exception as e:
        print(f"❌ Lỗi gửi email: {e}")
        return False

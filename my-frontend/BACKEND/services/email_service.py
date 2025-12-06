from flask import current_app, render_template_string
from flask_mail import Mail, Message
from threading import Thread
# Xóa import app để tránh circular import
from db import db
from models.notification_log import NotificationLog
from datetime import datetime

mail = Mail()

def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            print(f"✅ Email sent to {msg.recipients}")
        except Exception as e:
            print(f"❌ Failed to send email: {e}")

def send_email(subject, recipient, html_body):
    try:
        msg = Message(subject, recipients=[recipient])
        msg.html = html_body
        # Chạy thread riêng để không block server
        Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()
    except Exception as e:
        print(f"❌ Error preparing email: {e}")

# --- Templates ---

def send_otp_email(user_email, otp, purpose="reset"):
    if purpose == "reset":
        subject = "🔑 Mã OTP đặt lại mật khẩu của bạn"
        title = "Yêu cầu đặt lại mật khẩu"
        msg_content = f"Mã OTP của bạn là: <strong style='font-size: 24px; color: #007bff;'>{otp}</strong>"
        note = "Mã này sẽ hết hạn trong 10 phút."
    elif purpose == "register":
        subject = "🎉 Xác thực đăng ký tài khoản MySportCoach AI"
        title = "Chào mừng bạn đến với MySportCoach AI!"
        msg_content = f"Mã OTP xác thực của bạn là: <strong style='font-size: 24px; color: #28a745;'>{otp}</strong>"
        note = "Mã này sẽ hết hạn trong 10 phút. Vui lòng nhập mã để hoàn tất đăng ký."
    else:
        subject = "🔐 Mã OTP xác thực"
        title = "Xác thực tài khoản"
        msg_content = f"Mã xác thực của bạn là: <strong>{otp}</strong>"
        note = ""

    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">{title}</h2>
        <p>Xin chào,</p>
        <p>{msg_content}</p>
        <p>{note}</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua.</p>
        <br>
        <p>- MySportCoach AI Team</p>
    </div>
    """
    send_email(subject, user_email, html)
    return True

def send_welcome_email(user_email, user_name):
    subject = "Chào mừng đến với MySportCoach AI! 🚀"
    html = f"""
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Xin chào {user_name}! 👋</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>MySportCoach AI</strong>.</p>
        <p>Chúng tôi sẽ giúp bạn lên lịch tập luyện và dinh dưỡng chuẩn xác nhất.</p>
        <br>
        <p>Truy cập ngay: <a href="http://192.168.1.111:5173">MySportCoach Dashboard</a></p>
        <p>Chúc bạn tập luyện hiệu quả!</p>
    </div>
    """
    send_email(subject, user_email, html)

def send_reset_password_email(user_email, reset_link):
    subject = "🔒 Yêu cầu đặt lại mật khẩu"
    html = f"""
    <div style="font-family: Arial, sans-serif;">
        <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
        <p>Vui lòng click vào link dưới đây để đổi mật khẩu (hết hạn trong 15 phút):</p>
        <p><a href="{reset_link}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a></p>
        <p>Nếu không phải bạn, vui lòng bỏ qua email này.</p>
    </div>
    """
    send_email(subject, user_email, html)

def send_schedule_reminder(user, schedule_item, type="Workout"):
    """
    Gửi email nhắc nhở lịch tập hoặc ăn
    type: 'Workout' hoặc 'Meal'
    """
    if type == "Workout":
        subject = f"💪 Nhắc nhở: Lịch tập {schedule_item['title']} sắp tới!"
        content = f"Bạn có lịch tập <strong>{schedule_item['title']}</strong> vào lúc <strong>{schedule_item['time']}</strong>."
    else:
        subject = f"🍽️ Nhắc nhở: Đã đến giờ ăn {schedule_item['title']}!"
        content = f"Đừng quên bữa ăn: <strong>{schedule_item['title']}</strong> ({schedule_item['calories']} kcal) lúc <strong>{schedule_item['time']}</strong>."

    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2c3e50;">{subject}</h2>
        <p style="font-size: 16px;">Chào {user.Name},</p>
        <p style="font-size: 16px;">{content}</p>
        <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #007bff;">
            <p style="margin: 0;"><strong>Thời gian:</strong> {schedule_item['time']}</p>
            <p style="margin: 5px 0 0;"><strong>Ghi chú:</strong> Hãy chuẩn bị sẵn sàng nhé!</p>
        </div>
        <a href="http://192.168.1.111:5173/planner" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">Xem lịch trình</a>
    </div>
    """
    
    # Check log để không gửi trùng (Double check logic nên ở scheduler, nhưng check ở đây cho chắc)
    # Ở đây chúng ta chỉ gửi. Logic check sẽ nằm ở Scheduler.
    send_email(subject, user.Email, html)

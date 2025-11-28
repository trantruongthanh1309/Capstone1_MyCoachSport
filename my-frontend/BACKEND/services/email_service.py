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


def send_otp_email(recipient_email, otp_code, purpose="reset"):
    """
    Gửi mã OTP qua email với HTML template đẹp
    
    Args:
        recipient_email: Email người nhận
        otp_code: Mã OTP 6 số
        purpose: "reset" hoặc "register"
    """
    if "xxxx" in SENDER_PASSWORD:
        print("⚠️ Chưa cấu hình Email Password. Bỏ qua gửi mail.")
        print(f"📧 [DEV MODE] OTP cho {recipient_email}: {otp_code}")
        return True  # Return True trong dev mode để test
    
    try:
        # Tạo email message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"MySportCoach AI <{SENDER_EMAIL}>"
        msg['To'] = recipient_email
        
        if purpose == "reset":
            msg['Subject'] = "🔐 Mã xác thực đặt lại mật khẩu - MyCoachSport"
            title = "Đặt lại mật khẩu"
            description = "Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã OTP dưới đây để tiếp tục:"
        else:
            msg['Subject'] = "🎉 Chào mừng đến với MyCoachSport - Mã xác thực"
            title = "Xác thực tài khoản"
            description = "Cảm ơn bạn đã đăng ký! Sử dụng mã OTP dưới đây để hoàn tất đăng ký:"
        
        # HTML template đẹp
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 20px;
                    text-align: center;
                    color: white;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .content p {{
                    color: #555;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }}
                .otp-box {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-size: 42px;
                    font-weight: bold;
                    letter-spacing: 10px;
                    padding: 25px;
                    border-radius: 15px;
                    display: inline-block;
                    margin: 20px 0;
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                }}
                .warning {{
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                    color: #856404;
                    font-size: 14px;
                }}
                .footer {{
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #6c757d;
                    font-size: 14px;
                }}
                .icon {{
                    font-size: 60px;
                    margin-bottom: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">🏋️‍♂️</div>
                    <h1>MyCoachSport AI</h1>
                </div>
                <div class="content">
                    <h2 style="color: #333; margin-bottom: 20px;">{title}</h2>
                    <p>{description}</p>
                    
                    <div class="otp-box">
                        {otp_code}
                    </div>
                    
                    <div class="warning">
                        ⏰ <strong>Lưu ý:</strong> Mã OTP này có hiệu lực trong <strong>10 phút</strong>. 
                        Không chia sẻ mã này với bất kỳ ai!
                    </div>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #888;">
                        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2025 MyCoachSport AI - Your Personal Fitness Coach</p>
                    <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Attach HTML
        msg.attach(MIMEText(html, 'html'))
        
        # Gửi email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email OTP đã gửi thành công đến {recipient_email}")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi gửi email: {str(e)}")
        return False

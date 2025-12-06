import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';
import Toast from '../components/Toast';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Form đăng ký, 2: Nhập OTP
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            showToast('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        if (formData.password.length < 8) {
            showToast('Mật khẩu phải có ít nhất 8 ký tự', 'error');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Mã OTP đã được gửi đến email của bạn!', 'success');
                setStep(2); // Chuyển sang bước nhập OTP
            } else {
                showToast(data.error || 'Đăng ký thất bại', 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            showToast('Lỗi kết nối server', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            showToast('Vui lòng nhập mã OTP 6 số', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/verify-register-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp
                }),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Đăng ký thành công! Đang chuyển đến trang đăng nhập...', 'success');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                showToast(data.error || 'Mã OTP không đúng', 'error');
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            showToast('Lỗi kết nối server', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.backgroundShapes}>
                <div className={styles.shape1}></div>
                <div className={styles.shape2}></div>
                <div className={styles.shape3}></div>
            </div>

            <div className={styles.registerCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.iconContainer}>
                        <span className={styles.icon}>🏋️‍♂️</span>
                    </div>
                    <h1 className={styles.title}>
                        {step === 1 ? 'Tạo tài khoản' : 'Xác thực Email'}
                    </h1>
                    <p className={styles.subtitle}>
                        {step === 1
                            ? 'Bắt đầu hành trình fitness của bạn'
                            : `Nhập mã OTP đã gửi đến ${formData.email}`
                        }
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="name" className={styles.label}>
                                <span className={styles.labelIcon}>👤</span>
                                Họ và tên (Tùy chọn)
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Nhập họ và tên của bạn"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                <span className={styles.labelIcon}>📧</span>
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>
                                <span className={styles.labelIcon}>🔒</span>
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Tối thiểu 8 ký tự, chữ hoa, số, ký tự đặc biệt"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>
                                <span className={styles.labelIcon}>🔐</span>
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Nhập lại mật khẩu"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className={styles.loader}></span>
                            ) : (
                                <>
                                    <span>Tiếp tục</span>
                                    <span className={styles.buttonIcon}>→</span>
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="otp" className={styles.label}>
                                <span className={styles.labelIcon}>🔑</span>
                                Mã OTP (6 số)
                            </label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className={styles.input}
                                placeholder="Nhập mã OTP"
                                maxLength="6"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className={styles.loader}></span>
                            ) : (
                                <>
                                    <span>Xác thực</span>
                                    <span className={styles.buttonIcon}>✓</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className={styles.backButton}
                        >
                            ← Quay lại
                        </button>
                    </form>
                )}

                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        Đã có tài khoản?{' '}
                        <Link to="/login" className={styles.link}>
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>

            {toast.show && (
                <Toast message={toast.message} type={toast.type} />
            )}
        </div>
    );
};

export default Register;

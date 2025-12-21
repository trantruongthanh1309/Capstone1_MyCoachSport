import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import Toast from '../components/Toast';
import { validateEmail, validatePassword, validateOTP } from '../utils/validation';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
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

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            showToast('Vui lòng nhập email', 'error');
            return;
        }

        // Validate email format
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.valid) {
            showToast(emailValidation.message, 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Mã OTP đã được gửi đến email của bạn!', 'success');
                setStep(2);
            } else {
                showToast(data.error || 'Gửi OTP thất bại', 'error');
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            showToast('Lỗi kết nối server', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!formData.otp) {
            showToast('Vui lòng nhập mã OTP', 'error');
            return;
        }

        // Validate OTP format
        const otpValidation = validateOTP(formData.otp);
        if (!otpValidation.valid) {
            showToast(otpValidation.message, 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp
                }),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Xác thực thành công!', 'success');
                setStep(3);
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

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!formData.newPassword || !formData.confirmPassword) {
            showToast('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        // Validate password format (6-8 ký tự, có chữ hoa và chữ thường)
        const passwordValidation = validatePassword(formData.newPassword);
        if (!passwordValidation.valid) {
            showToast(passwordValidation.message, 'error');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword
                }),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...', 'success');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                showToast(data.error || 'Đặt lại mật khẩu thất bại', 'error');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            showToast('Lỗi kết nối server', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Mã OTP mới đã được gửi!', 'success');
            } else {
                showToast(data.error || 'Gửi lại OTP thất bại', 'error');
            }
        } catch (error) {
            showToast('Lỗi kết nối server', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.backgroundShapes}>
                <div className={styles.shape1}></div>
                <div className={styles.shape2}></div>
                <div className={styles.shape3}></div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.iconContainer}>
                        <span className={styles.icon}>🔐</span>
                    </div>
                    <h1 className={styles.title}>Quên mật khẩu</h1>
                    <p className={styles.subtitle}>
                        {step === 1 && 'Nhập email để nhận mã xác thực'}
                        {step === 2 && 'Nhập mã OTP đã gửi đến email'}
                        {step === 3 && 'Tạo mật khẩu mới'}
                    </p>
                </div>

                {}
                <div className={styles.progressSteps}>
                    <div className={`${styles.stepItem} ${step >= 1 ? styles.active : ''}`}>
                        <div className={styles.stepCircle}>1</div>
                        <span className={styles.stepLabel}>Email</span>
                    </div>
                    <div className={styles.stepLine}></div>
                    <div className={`${styles.stepItem} ${step >= 2 ? styles.active : ''}`}>
                        <div className={styles.stepCircle}>2</div>
                        <span className={styles.stepLabel}>OTP</span>
                    </div>
                    <div className={styles.stepLine}></div>
                    <div className={`${styles.stepItem} ${step >= 3 ? styles.active : ''}`}>
                        <div className={styles.stepCircle}>3</div>
                        <span className={styles.stepLabel}>Mật khẩu</span>
                    </div>
                </div>

                {}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                <span className={styles.labelIcon}>📧</span>
                                Email của bạn
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

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className={styles.loader}></span>
                            ) : (
                                <>
                                    <span>Gửi mã OTP</span>
                                    <span className={styles.buttonIcon}>→</span>
                                </>
                            )}
                        </button>
                    </form>
                )}

                {}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="otp" className={styles.label}>
                                <span className={styles.labelIcon}>🔢</span>
                                Mã OTP (6 số)
                            </label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="123456"
                                maxLength="6"
                                required
                            />
                            <p className={styles.hint}>
                                Mã OTP đã được gửi đến <strong>{formData.email}</strong>
                            </p>
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
                                    <span className={styles.buttonIcon}>→</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleResendOTP}
                            className={styles.resendButton}
                            disabled={loading}
                        >
                            Gửi lại mã OTP
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

                {}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="newPassword" className={styles.label}>
                                <span className={styles.labelIcon}>🔒</span>
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Tối thiểu 6 ký tự"
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
                                placeholder="Nhập lại mật khẩu mới"
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
                                    <span>Đặt lại mật khẩu</span>
                                    <span className={styles.buttonIcon}>✓</span>
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        Nhớ mật khẩu?{' '}
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

export default ForgotPassword;

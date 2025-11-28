import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';
import Toast from '../components/Toast';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            showToast('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        if (formData.password.length < 6) {
            showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Đăng ký thành công! Đang chuyển đến trang đăng nhập...', 'success');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
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
                    <h1 className={styles.title}>Tạo tài khoản</h1>
                    <p className={styles.subtitle}>Bắt đầu hành trình fitness của bạn</p>
                </div>

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
                                <span>Đăng ký</span>
                                <span className={styles.buttonIcon}>→</span>
                            </>
                        )}
                    </button>
                </form>

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

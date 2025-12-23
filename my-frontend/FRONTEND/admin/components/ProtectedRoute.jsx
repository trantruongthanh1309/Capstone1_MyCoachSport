import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function AdminRoute({ children }) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Kiểm tra authentication state
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn');
      const role = localStorage.getItem('role');
      
      setIsLoggedIn(loggedIn === 'true');
      setUserRole(role);
      setIsChecking(false);
    };

    checkAuth();

    // Lắng nghe sự thay đổi của localStorage (nếu có component khác thay đổi)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Kiểm tra lại khi location thay đổi (nhưng không clear state)
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

  // Đang kiểm tra, hiển thị loading hoặc không render gì
  if (isChecking) {
    return null; // hoặc có thể return một loading spinner
  }

  // Chưa đăng nhập, redirect nhưng không dùng replace để giữ lại history
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace={false} />;
  }

  // Không phải admin/manager, redirect về home nhưng không dùng replace
  if (userRole !== 'admin' && userRole !== 'manager') {
    return <Navigate to="/home" replace={false} />;
  }

  return children;
}
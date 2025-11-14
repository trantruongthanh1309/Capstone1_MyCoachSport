import { Navigate } from 'react-router-dom';

export function AdminRoute({ children }) {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  const userRole = sessionStorage.getItem('role');

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin' && userRole !== 'manager') {
    return <Navigate to="/home" replace />;
  }

  return children;
}
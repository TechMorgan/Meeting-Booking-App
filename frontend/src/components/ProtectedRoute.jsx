import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  if (!token) {
    // Determine which login route to redirect to based on role
    const redirectPath = role === 'Admin' ? '/admin-login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  try {
    const user = jwtDecode(token);

    if (role && user.role !== role) {
      // User is logged in but role is not authorized
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (err) {
    console.error('Token decode failed:', err);
    localStorage.removeItem('accessToken');
    const redirectPath = role === 'Admin' ? '/admin-login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
}

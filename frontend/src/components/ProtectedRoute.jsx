import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // ✅ Correct way


export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  const user = jwtDecode(token);
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

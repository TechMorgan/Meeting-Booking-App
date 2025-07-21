import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem('accessToken');

  const tryRefresh = async () => {
    try {
      const res = await api.post('/api/refresh-token');
      const newToken = res.data.accessToken;

      localStorage.setItem('accessToken', newToken);

      const decoded = jwtDecode(newToken);
      const role = decoded.role?.toLowerCase();

      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'employee') {
        navigate('/dashboard');
      } else {
        setCheckingAuth(false);
      }
    } catch (e) {
      console.error('Auto refresh failed:', e);
      localStorage.removeItem('accessToken');
      setCheckingAuth(false);
    }
  };

  if (token) {
    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        // Token expired, try to refresh
        tryRefresh();
      } else {
        const role = decoded.role?.toLowerCase();

        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else if (role === 'employee') {
          navigate('/dashboard');
        } else {
          setCheckingAuth(false);
        }
      }
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('accessToken');
      setCheckingAuth(false);
    }
  } else {
    // No token — try to refresh anyway (in case cookie still exists)
    tryRefresh();
  }
}, [navigate]);


  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/login', form);
      const { user, accessToken } = res.data;

      // Only allow employee login via this form
      if (user.role.toLowerCase() !== 'employee') {
        setError('Access denied. Use the admin login for admin access.');
        return;
      }

      localStorage.setItem('accessToken', accessToken);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-gray-700 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">Employee Login</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link to="/register" className="text-purple-600 hover:underline font-medium">
            Register here
          </Link>
        </p>

        <p className="text-center text-xs text-gray-500">
          <Link to="/" className="text-gray-400 hover:text-gray-700 underline">
            ← Back to Login Selection
          </Link>
        </p>
      </div>
    </div>
  );
}

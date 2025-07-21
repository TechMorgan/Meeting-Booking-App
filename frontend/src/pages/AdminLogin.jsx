import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem('accessToken');

  const tryRefresh = async () => {
    try {
      const res = await api.post('/refresh-token');
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
    } catch (err) {
      console.error('🔁 Refresh token failed:', err);
      localStorage.removeItem('accessToken');
      setCheckingAuth(false);
    }
  };

  if (token) {
    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        // Token expired, try refresh
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
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('accessToken');
      tryRefresh(); // Try refresh if token is malformed
    }
  } else {
    // No access token — try to refresh from cookie
    tryRefresh();
  }
}, [navigate]);


  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/login', form);
      const { user, accessToken } = res.data;

      if (user.role.toLowerCase() !== 'admin') {
        setError('Access denied. Please use the employee login.');
        return;
      }

      localStorage.setItem('accessToken', accessToken); // Ensure key is consistent across app
      navigate('/admin-dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">
          Admin Login
        </h2>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Login Selection
          </button>
        </div>
      </div>
    </div>
  );
}

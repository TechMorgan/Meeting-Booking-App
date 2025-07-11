import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const token = localStorage.getItem('token');
  let user = null;

  try {
    user = token ? jwtDecode(token) : null;
  } catch (e) {
    localStorage.clear();
    navigate('/select-login');
  }

  const dashboardRoute = user?.role === 'Admin' ? '/admin-dashboard' : '/dashboard';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hideNavbar = ['/', '/login', '/register', '/admin-login', '/select-login'].includes(location.pathname);
  if (hideNavbar) return null;

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white text-gray-800 shadow-md font-inter">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={dashboardRoute}
            className="text-xl font-bold tracking-wide text-gray-800 hover:text-gray-600"
          >
            📅 Meeting Room Booking App
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${user?.role}&background=random&size=32`}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded shadow-lg p-4 text-sm z-10 text-center">
                <p className="text-gray-700 text-lg">
                  <strong>{user?.username || 'N/A'}</strong>
                </p>
                <p className="text-gray-700">
                  {user?.role}
                </p>

                <button
                  onClick={logout}
                  className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop'; // Make sure path is correct
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Rooms from './pages/Rooms';
import BookRoom from './pages/BookRoom';
import SelectLogin from './pages/SelectLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Bookings from './pages/Bookings';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<SelectLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute role="Employee"><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/bookings"
          element={<ProtectedRoute role="Admin"><Bookings /></ProtectedRoute>}
        />
        <Route
          path="/bookings"
          element={<ProtectedRoute role="Employee"><MyBookings /></ProtectedRoute>}
        />
        <Route
          path="/rooms"
          element={<ProtectedRoute role="Admin"><Rooms /></ProtectedRoute>}
        />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/book"
          element={<ProtectedRoute role="Employee"><BookRoom /></ProtectedRoute>}
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

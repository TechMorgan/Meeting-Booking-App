import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setError('No token found');

    const { role } = jwtDecode(token);
    if (role !== 'Admin') {
      setError('Access denied: Admins only');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, usersRes, roomsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/users'),
        api.get('/rooms'),
      ]);
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
      setRooms(roomsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete booking');
    }
  };

  const getRoomName = (id) => rooms.find(r => r.id === id)?.name || 'Unknown';
  const getUserName = (id) => users.find(u => u.id === id)?.username || 'Unknown';

  const groupedBookings = bookings.reduce((acc, b) => {
    const date = new Date(b.start_time).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(b);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-bold text-gray-800">All Bookings</h2>
          <button
            onClick={() => setDeleteMode(!deleteMode)}
            className={`px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 ${
              deleteMode
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {deleteMode ? 'Exit Delete Mode' : 'Delete'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded shadow">
            {error}
          </div>
        )}

        {/* Booking List */}
        {Object.keys(groupedBookings).length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-10">No bookings found.</p>
        ) : (
          Object.entries(groupedBookings)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, bookingsForDate]) => (
              <div
                key={date}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-gray-200 overflow-hidden"
              >
                {/* Date Header */}
                <div className="bg-[#065084] text-white px-6 py-4 text-lg font-semibold tracking-wide">
                  {new Date(date).toDateString()}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-sm text-gray-700 uppercase">
                      <tr>
                        <th className="px-5 py-3 text-left">Room</th>
                        <th className="px-5 py-3 text-left">User</th>
                        <th className="px-5 py-3 text-left">Start</th>
                        <th className="px-5 py-3 text-left">End</th>
                        {deleteMode && <th className="px-5 py-3 text-left">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsForDate.map((b, i) => (
                        <tr
                          key={b.id}
                          className={`${
                            i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-indigo-50 transition-all text-gray-800 text-sm`}
                        >
                          <td className="px-5 py-4">{getRoomName(b.room_id)}</td>
                          <td className="px-5 py-4">{getUserName(b.user_id)}</td>
                          <td className="px-5 py-4">
                            {new Date(b.start_time).toLocaleString()}
                          </td>
                          <td className="px-5 py-4">
                            {new Date(b.end_time).toLocaleString()}
                          </td>
                          {deleteMode && (
                            <td className="px-5 py-4">
                              <button
                                onClick={() => handleDelete(b.id)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

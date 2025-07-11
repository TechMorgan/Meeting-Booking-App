import { useEffect, useState } from 'react';
import api from '../api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/bookings').then(res => setBookings(res.data));
    api.get('/rooms').then(res => setRooms(res.data));
  }, []);

  const cancelBooking = async (id) => {
    const confirm = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirm) return;

    try {
      await api.delete(`/bookings/${id}`);
      setMessage('✅ Booking cancelled.');
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch {
      setMessage('❌ Failed to cancel booking.');
    }
  };

  const getRoomName = (id) => {
    const room = rooms.find((r) => r.id === id);
    return room ? room.name : 'Unknown Room';
  };

  const getStatus = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime) return 'Upcoming';
    if (now >= startTime && now <= endTime) return 'Ongoing';
    return 'Past';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'border-yellow-400 bg-yellow-50 text-yellow-800';
      case 'Ongoing':
        return 'border-green-500 bg-green-50 text-green-900';
      case 'Past':
        return 'border-gray-300 bg-gray-100 text-gray-600';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl text-black font-bold mb-6">History</h2>

        {message && (
          <div className="mb-4 text-center text-sm bg-green-100 text-green-700 px-4 py-2 rounded">
            {message}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center text-gray-500">
            You don't have any bookings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((b) => {
              const status = getStatus(b.start_time, b.end_time);
              const statusStyle = getStatusStyle(status);

              return (
                <div
                  key={b.id}
                  className={`p-4 border-l-4 rounded shadow-sm ${statusStyle}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{getRoomName(b.room_id)}</h3>
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                  <p className="text-sm mb-1">
                    <strong>Start:</strong> {new Date(b.start_time).toLocaleString()}
                  </p>
                  <p className="text-sm mb-3">
                    <strong>End:</strong> {new Date(b.end_time).toLocaleString()}
                  </p>
                  {status !== 'Past' && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

export default function BookRoom() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchParams] = useSearchParams();
  const defaultRoomId = searchParams.get('room_id') || '';
  const [form, setForm] = useState({
    room_id: defaultRoomId,
    start_time: '',
    end_time: '',
  });
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    api.get('/rooms').then(res => setRooms(res.data));
    api.get('/bookings').then(res => setBookings(res.data));
  }, []);

  const isPast = (time) => new Date(time) < new Date();

  const hasConflict = () => {
    const start = new Date(form.start_time);
    const end = new Date(form.end_time);
    return bookings.some(
      (b) =>
        b.room_id.toString() === form.room_id &&
        !(new Date(b.end_time) <= start || new Date(b.start_time) >= end)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPast(form.start_time) || isPast(form.end_time)) {
      setMessage('❌ Cannot book in the past.');
      return;
    }
    if (hasConflict()) {
      setMessage('❌ Room is already booked during this time.');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmBooking = async () => {
    try {
      await api.post('/bookings', form);
      setMessage('✅ Room booked successfully!');
      setForm({ ...form, start_time: '', end_time: '' });
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage('❌ Room is already booked for that time.');
      } else {
        setMessage('❌ Booking failed.');
      }
    } finally {
      setShowConfirm(false);
    }
  };

  const selectedRoom = rooms.find((r) => r.id.toString() === form.room_id);

  return (
    <div className="min-h-screen bg-slate-100 font-inter p-6">
      <div className="max-w-xl mx-auto bg-white border border-slate-200 shadow-xl rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-black text-center">
          Book a Meeting Room
        </h2>

        {message && (
          <div
            className={`mb-6 text-center font-medium px-4 py-3 rounded-lg text-sm ${
              message.startsWith('✅')
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Display */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Room
            </label>
            <div className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700">
              {selectedRoom
                ? `${selectedRoom.name} – ${selectedRoom.location}`
                : 'Room not found'}
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              min={new Date().toISOString().slice(0, 16)}
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              min={form.start_time || new Date().toISOString().slice(0, 16)}
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#EAA64D] hover:bg-[#d88e3a] text-white font-semibold py-2.5 rounded-md shadow-lg transition"
          >
            Book Room
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Booking</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to book this room from <br />
              <span className="font-medium text-gray-800">
                {new Date(form.start_time).toLocaleString()}
              </span>{' '}
              to{' '}
              <span className="font-medium text-gray-800">
                {new Date(form.end_time).toLocaleString()}
              </span>?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmBooking}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium shadow"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

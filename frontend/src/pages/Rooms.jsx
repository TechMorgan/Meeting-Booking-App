import { useEffect, useState } from 'react';
import api from '../api';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    name: '',
    location: '',
    capacity: '',
    amenities: '',
  });
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRooms = () => {
    api.get('/rooms').then(res => setRooms(res.data));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoomId) {
        await api.put(`/rooms/${editingRoomId}`, form);
        setMessage('✅ Room updated successfully!');
      } else {
        await api.post('/rooms', form);
        setMessage('✅ Room added successfully!');
      }
      setForm({ name: '', location: '', capacity: '', amenities: '' });
      setEditingRoomId(null);
      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      setMessage('❌ Failed to save room.');
    }
  };

  const handleEdit = (room) => {
    setForm({
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      amenities: room.amenities,
    });
    setEditingRoomId(room.id);
    setIsModalOpen(true);
    setMessage('');
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      setMessage('✅ Room deleted successfully!');
      fetchRooms();
    } catch {
      setMessage('❌ Failed to delete room.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Room Management</h2>
      {message && <div className="mb-4 text-center font-medium">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Room Name"
          className="w-full p-2 border rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Location"
          className="w-full p-2 border rounded"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Capacity"
          className="w-full p-2 border rounded"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Amenities (comma-separated)"
          className="w-full p-2 border rounded"
          value={form.amenities}
          onChange={(e) => setForm({ ...form, amenities: e.target.value })}
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Room
        </button>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Rooms</h3>
        <ul className="space-y-3">
          {rooms.map((room) => (
            <li key={room.id} className="p-4 border rounded shadow-sm">
              <p className="font-bold">{room.name}</p>
              <p>Location: {room.location}</p>
              <p>Capacity: {room.capacity}</p>
              <p>Amenities: {room.amenities}</p>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => handleEdit(room)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Room</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Room Name"
                className="w-full p-2 border rounded"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Location"
                className="w-full p-2 border rounded"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Capacity"
                className="w-full p-2 border rounded"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Amenities (comma-separated)"
                className="w-full p-2 border rounded"
                value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRoomId(null);
                    setForm({ name: '', location: '', capacity: '', amenities: '' });
                  }}
                  className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

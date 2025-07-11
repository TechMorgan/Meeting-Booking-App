import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import DashboardCharts from './DashboardCharts';
import SidebarMenu from '../components/SidebarMenu';
import MyBookings from './MyBookings';

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/rooms').then((res) => setRooms(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex font-inter">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 space-y-6 shadow-sm hidden md:block">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Menu</h2>
        <SidebarMenu
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </aside>

      {/* Mobile Sidebar Popup */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative bg-white w-64 p-6 shadow-lg z-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Menu</h2>
            <SidebarMenu
              selectedTab={selectedTab}
              setSelectedTab={(tab) => {
                setSelectedTab(tab);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 capitalize">
            {selectedTab === 'dashboard' ? 'Dashboard' : 'My Bookings'}
          </h2>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-gray-700 hover:text-gray-900 p-2 rounded focus:outline-none"
            aria-label="Open Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Conditional Content */}
        {selectedTab === 'dashboard' ? (
          <div className="max-w-7xl mx-auto space-y-16">

            {/* Booking Status */}
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-2">
                <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Booking Status</h2>
                <p className="text-sm text-gray-500 mt-1">Overview of room bookings</p>
              </div>
              <DashboardCharts />
            </div>

            {/* Available Meeting Rooms */}
            <div className="space-y-8">
              <div className="border-b border-gray-300 pb-2">
                <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Available Meeting Rooms</h2>
                <p className="text-sm text-gray-500 mt-1">Choose a room and book your slot</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-200 p-6 transition"
                  >
                    <div className="mb-3">
                      <h3 className="text-2xl font-semibold text-gray-800">{room.name}</h3>
                      <p className="text-sm text-gray-500">{room.location}</p>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1 mb-5">
                      <p><span className="font-medium">Capacity:</span> {room.capacity}</p>
                      <p><span className="font-medium">Amenities:</span> {room.amenities}</p>
                    </div>
                    <Link
                      to={`/book?room_id=${room.id}`}
                      className="inline-block w-full text-center bg-[#EAA64D] hover:bg-[#d88e3a] text-black px-4 py-2 rounded-lg font-medium shadow-md transition"
                    >
                      Book Room
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <MyBookings />
        )}
      </main>
    </div>
  );
}

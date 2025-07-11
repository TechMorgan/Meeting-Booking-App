import { FaChartPie, FaCalendarCheck } from 'react-icons/fa';

export default function SidebarMenu({ selectedTab, setSelectedTab }) {
  const items = [
    { label: 'Dashboard', value: 'dashboard', icon: <FaChartPie /> },
    { label: 'My Bookings', value: 'bookings', icon: <FaCalendarCheck /> },
  ];

  return (
    <nav className="space-y-2">
      {items.map(({ label, value, icon }) => (
        <button
          key={value}
          onClick={() => setSelectedTab(value)}
          className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg font-medium transition ${
            selectedTab === value
              ? 'bg-indigo-100 text-indigo-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="text-lg">{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}

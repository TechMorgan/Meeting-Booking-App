import { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../api';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(LineElement, PointElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function DashboardCharts() {
  const [bookings, setBookings] = useState([]);
  const [dailyCounts, setDailyCounts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ upcoming: 0, ongoing: 0, past: 0 });

  useEffect(() => {
    api.get('/bookings').then(res => {
      setBookings(res.data);
      computeStatus(res.data);
      computeDaily(res.data);
    });
  }, []);

  const computeStatus = (data) => {
    const now = new Date();
    let upcoming = 0, ongoing = 0, past = 0;

    data.forEach(b => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      if (end < now) past++;
      else if (start > now) upcoming++;
      else ongoing++;
    });

    setStatusCounts({ upcoming, ongoing, past });
  };

  const computeDaily = (data) => {
    const now = new Date();
    const past14 = [...Array(14)].map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().slice(0, 10);
    });

    const counts = Object.fromEntries(past14.map(d => [d, 0]));

    data.forEach(b => {
      const date = b.start_time.slice(0, 10);
      if (counts[date] !== undefined) {
        counts[date]++;
      }
    });

    setDailyCounts(Object.entries(counts));
  };

  const lineData = {
    labels: dailyCounts.map(([date]) => date.slice(5)),
    datasets: [
      {
        label: 'Bookings',
        data: dailyCounts.map(([_, count]) => count),
        borderColor: '#6366f1', // Indigo-500
        backgroundColor: '#e0e7ff', // Indigo-100
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#4338ca', // Indigo-700
      },
    ],
  };

  const donutData = {
    labels: ['Upcoming', 'Ongoing', 'Past'],
    datasets: [
      {
        data: [statusCounts.upcoming, statusCounts.ongoing, statusCounts.past],
        backgroundColor: ['#f97316', '#10b981', '#94a3b8'], // Orange, Emerald, Slate
        cutout: '70%',
      },
    ],
  };

  const legendItems = [
    { label: 'Upcoming', value: statusCounts.upcoming, color: '#f97316' },
    { label: 'Ongoing', value: statusCounts.ongoing, color: '#10b981' },
    { label: 'Past', value: statusCounts.past, color: '#94a3b8' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {/* Line Chart */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-gray-700">Bookings Over Time</h4>
          <span className="text-gray-900 font-bold text-lg">
            {bookings.length}
          </span>
        </div>
        <div className="h-64">
          <Line
            data={lineData}
            options={{
              scales: {
                x: {
                  grid: { display: false },
                },
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                  grid: { color: '#e5e7eb' },
                },
              },
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between gap-6">
        <div className="relative w-40 h-40">
          <Doughnut data={donutData} options={{ plugins: { legend: { display: false } } }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-800 text-center">
            <span className="text-2xl font-bold">{bookings.length}</span>
            <span className="text-sm text-gray-500">Total</span>
          </div>
        </div>
        <ul className="text-sm space-y-2">
          {legendItems.map((item, i) => (
            <li key={i} className="flex justify-between items-center gap-2 text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.label}
              </div>
              <span className="font-medium text-gray-800">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

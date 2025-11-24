// src/components/TrafficChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Đăng ký các thành phần cần thiết
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// === CHÚ Ý DÒNG NÀY ===
// Chúng ta dùng "export function" (xuất có tên)
export function TrafficChart({ trafficData }) {
  
  const data = {
    labels: trafficData.map(item => item.day),
    datasets: [
      {
        label: 'Lượt truy cập',
        data: trafficData.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(173, 109, 244, 0.2)',
        borderColor: 'rgba(173, 109, 244, 1)',
        tension: 0.2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return <Line options={options} data={data} />;
}
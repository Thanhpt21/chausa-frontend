'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FC } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ExportStats {
  pending: number;
  exporting: number;
  completed: number;
  cancelled: number;
  rejected: number;
}

interface Props {
  stats: ExportStats;
}

const ExportStatusChart: FC<Props> = ({ stats }) => {
  const data: ChartData<'bar'> = {
    labels: ['Mã đơn hàng'],
    datasets: [
      {
        label: 'Chờ xử lý',
        data: [stats.pending],
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
      },
      {
        label: 'Đang xử lý',
        data: [stats.exporting],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Đã hoàn thành',
        data: [stats.completed],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
      {
        label: 'Đã huỷ',
        data: [stats.cancelled],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
      {
        label: 'Đã từ chối',
        data: [stats.rejected],
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Trạng thái Mã đơn hàng' },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ExportStatusChart;

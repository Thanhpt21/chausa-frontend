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

interface ImportStats {
  pending: number;
  completed: number;
  cancelled: number;
}

interface Props {
  stats: ImportStats;
}

const ImportStatusChart: FC<Props> = ({ stats }) => {
  const data: ChartData<'bar'> = {
    labels: ['Phiếu nhập kho'],
    datasets: [
      {
        label: 'Chờ xử lý',
        data: [stats.pending],
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
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
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Trạng thái phiếu nhập kho' },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ImportStatusChart;

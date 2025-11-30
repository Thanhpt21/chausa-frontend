'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import { FC } from 'react';

// Đăng ký các thành phần cần thiết
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Định nghĩa props truyền vào
interface RevenueChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

const RevenueChart: FC<RevenueChartProps> = ({ data, options }) => {
  return <Bar data={data} options={options} />;
};

export default RevenueChart;

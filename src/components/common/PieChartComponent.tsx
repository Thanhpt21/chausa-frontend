'use client';

import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  labels: string[];
  data: number[];
  colors?: string[];
  title?: string;
}

const PieChartComponent: React.FC<PieChartProps> = ({ labels, data, colors, title }) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors || [
          '#1890ff',
          '#52c41a',
          '#faad14',
          '#eb2f96',
          '#13c2c2',
          '#722ed1',
        ],
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <Pie data={chartData} />
    </div>
  );
};

export default PieChartComponent;

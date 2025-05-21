'use client';

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
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeatherData {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
}

const options: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
};

export function WeatherChart({ data }: { data: WeatherData[] }) {
  const chartData: ChartData<'line'> = {
    labels: data.map(d => new Date(d.dt * 1000).toLocaleTimeString()),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: data.map(d => d.main.temp),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Feels Like (°C)',
        data: data.map(d => d.main.feels_like),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Humidity (%)',
        data: data.map(d => d.main.humidity),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="w-full h-[300px] bg-card rounded-lg p-4">
      <Line options={options} data={chartData} />
    </div>
  );
}

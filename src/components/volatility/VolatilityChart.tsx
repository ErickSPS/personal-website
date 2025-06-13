'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@/components/providers/ThemeProvider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VolatilityChartProps {
  historicalData: number[];
  forecastData: number[];
  labels: string[];
}

export default function VolatilityChart({
  historicalData,
  forecastData,
  labels,
}: VolatilityChartProps) {
  const { isDarkMode } = useTheme();

  // Validate and sanitize input data
  const validatedHistorical = Array.isArray(historicalData) ? historicalData : [];
  const validatedForecast = Array.isArray(forecastData) ? forecastData : [];
  const validatedLabels = Array.isArray(labels) ? labels : [];

  // Ensure all arrays have valid lengths
  const maxLength = Math.min(
    validatedHistorical.length,
    validatedLabels.length
  );

  // Create properly sized arrays
  const safeHistorical = validatedHistorical.slice(0, maxLength);
  const safeForecast = validatedForecast.slice(0, Math.min(validatedForecast.length, maxLength));
  const safeLabels = validatedLabels.slice(0, maxLength);

  // Calculate the null padding for forecast data
  const paddingLength = Math.max(0, safeHistorical.length - safeForecast.length);
  const paddedForecast = Array(paddingLength).fill(null).concat(safeForecast);

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
        },
      },
      title: {
        display: true,
        text: 'Volatility Analysis',
        color: isDarkMode ? '#e5e7eb' : '#374151',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
        },
      },
      y: {
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
        },
        title: {
          display: true,
          text: 'Volatility (%)',
          color: isDarkMode ? '#e5e7eb' : '#374151',
        },
      },
    },
  };

  const data = {
    labels: safeLabels,
    datasets: [
      {
        label: 'Historical Volatility',
        data: safeHistorical,
        borderColor: '#2DBBB8',
        backgroundColor: 'rgba(45, 187, 184, 0.1)',
        borderWidth: 2,
        pointRadius: 1,
        fill: true,
      },
      {
        label: 'Forecasted Volatility',
        data: paddedForecast,
        borderColor: '#FFB142',
        backgroundColor: 'rgba(255, 177, 66, 0.1)',
        borderWidth: 2,
        pointRadius: 1,
        borderDash: [5, 5],
        fill: true,
      },
    ],
  };

  // If we have no valid data, show a message
  if (maxLength === 0) {
    return (
      <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No volatility data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      <Line options={options} data={data} />
    </div>
  );
} 
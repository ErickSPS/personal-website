'use client';

import React, { Suspense, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
  type ScriptableContext,
  type ChartData
} from 'chart.js';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/ThemeProvider';
import { colors } from '@/app/styles/colors';
import './ChartConfig';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Line = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

interface VolatilityChartProps {
  historicalData: number[];
  forecastData: (number | null)[];
  ensembleForecastData: (number | null)[];
  labels: string[];
  className?: string;
}

interface DataPoint {
  impliedVol: number | null;
}

export default function VolatilityChart({
  historicalData,
  forecastData,
  ensembleForecastData,
  labels,
  className = '',
}: VolatilityChartProps) {
  const { isDarkMode } = useTheme();

  // Debug data structure
  useEffect(() => {
    console.log('Chart data check:', {
      historicalLength: historicalData.length,
      forecastLength: forecastData.length,
      lastHistorical: historicalData[historicalData.length - 1],
      firstForecast: forecastData.find(x => x !== null),
      labels
    });
  }, [historicalData, forecastData, labels]);

  const data: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Historical Volatility',
        data: historicalData,
        borderColor: isDarkMode ? colors.primary.light : colors.primary.DEFAULT,
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 6,
        spanGaps: false,
        order: 1
      },
      {
        label: 'EWMA Fast',
        data: forecastData,
        borderColor: isDarkMode ? colors.secondary.light : colors.secondary.DEFAULT,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 4],
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 6,
        spanGaps: true,
        order: 2
      },
      {
        label: 'Ensemble Forecast',
        data: ensembleForecastData,
        borderColor: isDarkMode ? colors.accent.light : colors.accent.DEFAULT,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 6,
        spanGaps: true,
        order: 3
      },
      {
        label: 'Implied Vol',
        data: (historicalData.map((_, i) => {
          const date = new Date(labels[i]);
          return date > new Date() ? null : historicalData[i];
        })) as (number | null)[],
        borderColor: isDarkMode ? colors.text['dark-muted'] : colors.text.muted,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [2, 2],
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 6,
        spanGaps: true,
        order: 4
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    animation: {
      duration: 750,
      easing: 'easeOutQuart',
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 10
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          boxWidth: 16,
          boxHeight: 16,
          padding: 20,
          color: isDarkMode ? colors.text.dark : colors.text.DEFAULT,
          font: {
            size: 12,
            weight: 'normal',
            family: 'Inter, system-ui, sans-serif',
          },
          usePointStyle: true,
          pointStyle: 'line',
          filter: (legendItem) => {
            const dataset = data.datasets[legendItem.datasetIndex || 0];
            return dataset.data.some(value => value !== null);
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode ? colors.background.dark : colors.background.DEFAULT,
        titleColor: isDarkMode ? colors.text.dark : colors.text.DEFAULT,
        bodyColor: isDarkMode ? colors.text['dark-muted'] : colors.text.muted,
        borderColor: isDarkMode ? colors.border.dark : colors.border.DEFAULT,
        borderWidth: 1,
        padding: {
          x: 12,
          y: 8,
        },
        bodyFont: {
          size: 12,
          family: 'Inter, system-ui, sans-serif',
        },
        titleFont: {
          size: 12,
          weight: 'bold',
          family: 'Inter, system-ui, sans-serif',
        },
        callbacks: {
          title: function(context: TooltipItem<'line'>[]) {
            try {
              const date = new Date(context[0].label);
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC'
              });
            } catch (error) {
              return context[0].label;
            }
          },
          label: function(context: TooltipItem<'line'>) {
            if (context.parsed.y !== null) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
            }
            return `${context.dataset.label}: N/A`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          color: isDarkMode ? colors.text['dark-muted'] : colors.text.muted,
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: function(value: string | number): string {
            try {
              const date = new Date(value.toString());
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
              });
            } catch (error) {
              return '';
            }
          }
        },
      },
      y: {
        type: 'linear',
        grid: {
          color: isDarkMode ? `${colors.border.dark}40` : `${colors.border.DEFAULT}40`,
          lineWidth: 1,
          display: true,
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDarkMode ? colors.text['dark-muted'] : colors.text.muted,
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: function(value: string | number): string {
            return value.toLocaleString('en-US', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }) + '%';
          },
          stepSize: 5,
          padding: 8,
        },
        title: {
          display: true,
          text: 'Volatility (%)',
          color: isDarkMode ? colors.text['dark-muted'] : colors.text.muted,
          font: {
            size: 12,
            weight: 'normal',
            family: 'Inter, system-ui, sans-serif',
          },
          padding: { bottom: 12 },
        },
        min: 0,
        max: 60,
        suggestedMin: 10,
        suggestedMax: 50,
      },
    },
  };

  return (
    <div className={`${className} card`}>
      <Suspense fallback={<div>Loading chart...</div>}>
        <Line data={data} options={options} />
      </Suspense>
    </div>
  );
} 
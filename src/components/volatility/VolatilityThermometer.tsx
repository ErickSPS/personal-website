import React from 'react';
import { Line } from 'react-chartjs-2';
import { VolatilityMetrics } from '@/types/volatility';

interface VolatilityThermometerProps {
  data: VolatilityMetrics[];
  className?: string;
}

export default function VolatilityThermometer({ data, className = '' }: VolatilityThermometerProps) {
  const latestData = data.length > 0 ? data[data.length - 1] : {
    rolling30d: 0,
    ensemble: 0,
    impliedVol: 0,
    timestamp: '',
    ewmaFast: 0
  };

  const volSpread = latestData.ensemble - latestData.impliedVol;
  let signalColor = 'bg-yellow-500';
  let signalText = 'Neutral - Monitor Market';

  if (volSpread > 1) {
    signalColor = 'bg-red-500';
    signalText = 'Buy Volatility';
  } else if (volSpread < -1) {
    signalColor = 'bg-green-500';
    signalText = 'Sell Volatility';
  }

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    }),
    datasets: [
      {
        label: 'Historical (30d)',
        data: data.map(d => d.rolling30d),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Ensemble Forecast',
        data: data.map(d => d.ensemble),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Implied Vol',
        data: data.map(d => d.impliedVol),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter',
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Volatility (%)',
        },
      },
    },
  };

  return (
    <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Volatility Thermometer</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Comparative analysis of volatility metrics and trading signals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Historical Volatility</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{latestData.rolling30d.toFixed(1)}%</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Ensemble Forecast</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{latestData.ensemble.toFixed(1)}%</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Implied Volatility</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{latestData.impliedVol.toFixed(1)}%</div>
        </div>
      </div>

      <div className="mb-8">
        <div className={`p-4 ${signalColor} rounded-lg text-white`}>
          <div className="font-medium">Trading Signal</div>
          <div className="text-lg">{signalText}</div>
          <div className="text-sm mt-1">
            Ensemble-IV Spread: {(latestData.ensemble - latestData.impliedVol).toFixed(1)} pp
          </div>
        </div>
      </div>

      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Interpretation</h4>
        <ul className="space-y-2">
          <li className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Green: Opportunity to sell volatility (Ensemble {'<'} IV - 1pp)</span>
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Yellow: Caution zone (|Ensemble - IV| {'<'} 1pp)</span>
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Red: Opportunity to buy volatility (Ensemble {'>'} IV + 1pp)</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 
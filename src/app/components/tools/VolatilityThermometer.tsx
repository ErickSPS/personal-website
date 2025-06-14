'use client';

// DEPLOYMENT FORCE REFRESH - 2025-01-03T19:30:00Z
// Fixed Chart.js hydration issues for Vercel deployment

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
import { useTheme } from '../../../components/providers/ThemeProvider';
import { fetchVolatilityData, processVolatilityData } from '../../trading-tools/volatility-forecast/volatility.service';

// Dynamic import for Chart.js to prevent SSR issues
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>,
});

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

interface VolatilityMetrics {
  timestamp: string;
  rolling30d: number | null;
  ewmaFast: number | null;
  ensemble: number | null;
  impliedVol: number | null;
}

interface VolatilityThermometerProps {
  className?: string;
  data?: VolatilityMetrics[];
  ticker?: string;
}

const getSignalColor = (ensemble: number | null, impliedVol: number | null): string => {
  if (!ensemble || !impliedVol) return '#6B7280'; // Gray for neutral when data is missing
  const diff = ensemble - impliedVol;
  if (diff < -1) return '#EF4444'; // Red for sell signal (ensemble < implied, so sell volatility)
  if (diff > 1) return '#22C55E'; // Green for buy signal (ensemble > implied, so buy volatility)
  return '#6B7280'; // Gray for neutral
};

const getSignalText = (ensemble: number | null, impliedVol: number | null): string => {
  if (!ensemble || !impliedVol) return 'Insufficient Data';
  const diff = ensemble - impliedVol;
  if (diff < -1) return 'Sell Volatility';
  if (diff > 1) return 'Buy Volatility';
  return 'Neutral Zone';
};

export default function VolatilityThermometer({
  className = '',
  data = [],
  ticker = 'SPY'
}: VolatilityThermometerProps) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [volData, setVolData] = useState<VolatilityMetrics[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure this is client-side for Chart.js hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[VolatilityThermometer] Fetching data for ${ticker}...`);
        
        const response = await fetch(`/api/volatility/forecast?ticker=${ticker}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[VolatilityThermometer] API response:', {
          hasData: !!data,
          labelsLength: data.labels?.length,
          historicalLength: data.historicalData?.length,
          forecastLength: data.forecastData?.length,
          ensembleLength: data.ensembleForecastData?.length,
          impliedVol: data.impliedVol
        });
        
        if (!data.labels || !data.historicalData) {
          throw new Error('Invalid data format received from API');
        }
        
        const processedData = processVolatilityData({
          dates: data.labels,
          historical: data.historicalData,
          ewma_fast: data.forecastData,
          ensemble: data.ensembleForecastData,
          implied_vol: data.impliedVol
        });
        
        // Transform the data into the expected format and filter out invalid entries
        // Get the latest implied volatility value (the last non-null value)
        const latestImpliedVol = data.impliedVol || 20; // fallback value
        
        const metrics = processedData.labels.map((date: string, i: number) => ({
          timestamp: date,
          rolling30d: processedData.historicalData[i] || null,
          ewmaFast: processedData.forecastData[i] || null,
          ensemble: processedData.ensembleForecastData?.[i] || null,
          // Only assign implied vol to the last data point where we have it
          impliedVol: i === processedData.labels.length - 1 ? latestImpliedVol : null
        })).filter((metric: VolatilityMetrics) => 
          metric.timestamp && 
          (metric.rolling30d !== null || 
           metric.ewmaFast !== null || 
           metric.ensemble !== null || 
           metric.impliedVol !== null)
        );
        
        // Sort by date
        metrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        console.log('[VolatilityThermometer] Processed data:', {
          metricsLength: metrics.length,
          firstMetric: metrics[0],
          lastMetric: metrics[metrics.length - 1]
        });
        
        setVolData(metrics);
      } catch (error) {
        console.error('[VolatilityThermometer] Error fetching volatility data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
        // Set fallback data to prevent empty charts
        const fallbackData: VolatilityMetrics[] = [
          {
            timestamp: new Date().toISOString(),
            rolling30d: 15,
            ewmaFast: 18,
            ensemble: 22,
            impliedVol: 20
          }
        ];
        setVolData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    if (ticker && isClient) {
      fetchData();
    }
  }, [ticker, isClient]);

  // Find the last valid data point with proper null checks
  const latestData = volData.reduceRight((acc, curr) => {
    // If we already found a valid data point with ensemble, keep it
    if (acc.ensemble !== null) {
      return acc;
    }
    // If current item has valid ensemble data, use it
    if (curr.ensemble !== null) {
      return curr;
    }
    // Otherwise, keep looking
    return acc;
  }, {
    timestamp: '',
    rolling30d: null,
    ensemble: null,
    impliedVol: null,
    ewmaFast: null
  } as VolatilityMetrics);

  // Get the latest implied volatility from the last data point that has it
  const latestImpliedVol = volData.reduceRight((acc: number | null, curr) => 
    acc !== null ? acc : curr.impliedVol, null as number | null
  );

  // Use the latest implied volatility for signal calculation
  const signalColor = getSignalColor(latestData.ensemble, latestImpliedVol);
  const signalText = getSignalText(latestData.ensemble, latestImpliedVol);

  const chartData = {
    labels: volData.map(d => {
      const date = new Date(d.timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    }),
    datasets: [
      {
        label: 'Historical Volatility',
        data: volData.map(d => d.rolling30d),
        borderColor: isDarkMode ? '#40D6D3' : '#2DBBB8',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        spanGaps: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'EWMA Fast',
        data: volData.map(d => d.ewmaFast),
        borderColor: isDarkMode ? '#1B5A84' : '#0A3D62',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        spanGaps: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Ensemble Forecast',
        data: volData.map(d => d.ensemble),
        borderColor: isDarkMode ? '#FFC168' : '#FFB142',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        spanGaps: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Implied Volatility',
        data: volData.map(d => d.impliedVol),
        borderColor: isDarkMode ? '#E69422' : '#D35400',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        spanGaps: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  } as ChartData<'line'>;

  // Calculate spread with null checks
  const spread = latestData.ensemble && latestImpliedVol 
    ? (latestData.ensemble - latestImpliedVol).toFixed(1) + '%'
    : 'N/A';

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          boxWidth: 16,
          boxHeight: 16,
          padding: 16,
          color: isDarkMode ? '#D1D5DB' : '#4B5563',
          font: {
            size: 12,
            weight: 'normal',
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        titleColor: isDarkMode ? '#F3F4F6' : '#111827',
        bodyColor: isDarkMode ? '#D1D5DB' : '#4B5563',
        borderColor: isDarkMode ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 12,
          weight: 'bold',
        },
        callbacks: {
          label: function(context) {
            if (context.parsed.y !== null) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
            }
            return `${context.dataset.label}: N/A`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? '#374151' : '#E5E7EB',
          display: false,
        },
        ticks: {
          color: isDarkMode ? '#D1D5DB' : '#4B5563',
          font: {
            size: 11,
          },
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: isDarkMode ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: isDarkMode ? '#D1D5DB' : '#4B5563',
          callback: function(value) {
            return value + '%';
          },
          stepSize: 5,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
        <div className="text-center py-8">
          <div className="text-red-500 dark:text-red-400 mb-2">⚠️ Data Loading Error</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{error}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Showing fallback data for demonstration
          </div>
        </div>
      </div>
    );
  }

  // Only render chart if we're on the client side to prevent hydration issues
  if (!isClient) {
    return (
      <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Volatility Analysis Dashboard</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Real-time volatility analysis and trading signals for {ticker}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Historical Volatility</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {latestData.rolling30d?.toFixed(1) || 'N/A'}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">30-day rolling</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Ensemble Forecast</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {latestData.ensemble?.toFixed(1) || 'N/A'}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Next 30 days</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Implied Volatility</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {latestImpliedVol?.toFixed(1) || 'N/A'}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">30-day ATM</div>
        </div>
      </div>

      <div className="mb-6">
        <div style={{ height: '400px' }}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Trading Signal</div>
          <div className="text-xl font-bold" style={{ color: signalColor }}>
            {signalText}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ensemble-IV Spread: {spread}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Interpretation</div>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div>• {'< -1%'}: Opportunity to sell volatility</div>
            <div>• {'-1% to 1%'}: Caution zone</div>
            <div>• {'> 1%'}: Opportunity to buy volatility</div>
          </div>
        </div>
      </div>
    </div>
  );
} 
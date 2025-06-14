'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Card from '../ui/Card';
import VolatilityThermometer from './VolatilityThermometer';
import PositionSizer from './PositionSizer';
import EventsCalendar from './EventsCalendar';
import StrategySuggestions from './StrategySuggestions';
import { ChevronDownIcon, ChevronUpIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Line } from 'react-chartjs-2';
import { fetchVolatilityData, processVolatilityData, fetchMarketEvents } from '@/app/trading-tools/volatility-forecast/volatility.service';
import Trademark from '../ui/Trademark';

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

// Additional registration to ensure components are available
if (typeof window !== 'undefined') {
  try {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );
  } catch (error) {
    console.error('Chart.js registration error:', error);
  }
}

interface VolatilityForecastProps {
  className?: string;
  ticker?: string;
  accountSize?: number;
}

interface VolatilityMetrics {
  rolling30d: number;
  ewmaFast: number;
  ensemble: number;
  impliedVol: number;
  timestamp: string;
}

interface MarketEvent {
  type: 'earnings' | 'fomc' | 'economic' | 'custom';
  date: Date;
  title: string;
  description: string;
  expectedVolImpact: number;
  historicalAvgMove: number;
}

interface VolatilityData {
  historicalData: number[];
  forecastData: (number | null)[];
  ensembleForecastData?: (number | null)[];
  labels: string[];
  historicalVol: number;
}

const DEFAULT_TICKERS = ['SPY', 'QQQ', 'IWM', 'DIA', 'VIX'];

export default function VolatilityForecast({ 
  className = '',
  ticker = 'SPY',
  accountSize = 100000,
}: VolatilityForecastProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [volData, setVolData] = useState<VolatilityMetrics[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [spotPrice, setSpotPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<VolatilityData | null>(null);
  const [selectedTicker, setSelectedTicker] = useState(ticker);
  const [isClient, setIsClient] = useState(false);

  // Ensure this is client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch data using the proper volatility service
  const fetchData = async (ticker: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching data for ${ticker}...`);
      const volResponse = await fetchVolatilityData(ticker);
      console.log('Raw API response:', volResponse);
      
      const result = processVolatilityData(volResponse);
      console.log('Processed data:', result);
      
      // Create properly formatted volatility metrics
      const metrics: VolatilityMetrics[] = result.labels.map((date: string, i: number) => ({
        rolling30d: result.historicalData[i] || 0,
        ewmaFast: result.forecastData[i] || 0,
        ensemble: result.ensembleForecastData?.[i] || 0,
        impliedVol: result.modelPredictions?.implied || 0,
        timestamp: date
      }));

      console.log('Created metrics:', metrics.slice(0, 5)); // Log first 5 entries
      console.log('Setting analysis results with:', {
        historicalData: result.historicalData.length,
        forecastData: result.forecastData.length,
        ensembleForecastData: result.ensembleForecastData?.length,
        labels: result.labels.length,
        historicalVol: result.historicalVol
      });

      setVolData(metrics);
      setAnalysisResults({
        historicalData: result.historicalData,
        forecastData: result.forecastData,
        ensembleForecastData: result.ensembleForecastData,
        labels: result.labels,
        historicalVol: result.historicalVol || 0
      });
      
      // Also set implied vol from the result
      if (result.modelPredictions?.implied) {
        setSpotPrice(result.modelPredictions.implied); // Using implied vol as proxy for recent data
      }
      
      console.log('Data fetch completed successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch volatility data');
      setAnalysisResults(null);
      setLoading(false);
    }
  };
  
  // Auto-fetch data when component mounts or ticker changes
  useEffect(() => {
    setSelectedTicker(ticker);
    fetchData(ticker);
  }, [ticker]);

  const chartData = analysisResults ? {
    labels: analysisResults.labels,
    datasets: [
      {
        label: 'Historical Volatility',
        data: analysisResults.historicalData,
        borderColor: isDarkMode ? '#40D6D3' : '#2DBBB8',
        backgroundColor: 'transparent',
        borderWidth: 2,
      },
      {
        label: 'Volatility Forecast',
        data: analysisResults.forecastData,
        borderColor: isDarkMode ? '#FFC168' : '#FFB142',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
      },
      {
        label: 'Ensemble Forecast',
        data: analysisResults.ensembleForecastData || [],
        borderColor: isDarkMode ? '#A78BFA' : '#8B5CF6',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [10, 5],
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Volatility (%)',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
        },
        grid: {
          color: isDarkMode ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
        },
      },
      x: {
        grid: {
          color: isDarkMode ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
        },
      },
    },
  };

  if (loading) {
    return (
      <Card className={`${className} p-6 animate-pulse`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
        <div className="space-y-4">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  const latestData = volData[volData.length - 1] || {
    rolling30d: 0,
    ewmaFast: 0,
    ensemble: 0,
    impliedVol: 0,
    timestamp: new Date().toISOString()
  };
  const hasUpcomingEvents = events.some(
    e => e.date.getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000
  );

  return (
    <Card className={`${className} p-6 space-y-6`}>
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Volatility Forecast - {selectedTicker}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Professional forecasting and trading recommendations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm"
            >
              {showInfo ? (
                <>
                  <span className="mr-1">Hide Details</span>
                  <ChevronUpIcon className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="mr-1">Show Details</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-800 p-6 rounded-lg space-y-5 border border-blue-100 dark:border-blue-900 mb-6">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-300 text-lg mb-2">Advanced Analysis</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This tool combines multiple statistical models to provide
                accurate volatility forecasts and data-driven trading recommendations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Components</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium min-w-[140px]">Historical Volatility:</span>
                    <span className="text-blue-700 dark:text-blue-300">Standard deviation of returns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium min-w-[140px]">EWMA Fast:</span>
                    <span className="text-blue-700 dark:text-blue-300">Sensitive to recent changes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium min-w-[140px]">EWMA Slow:</span>
                    <span className="text-blue-700 dark:text-blue-300">Identification of trends</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium min-w-[140px]">Ensemble:</span>
                    <span className="text-blue-700 dark:text-blue-300">Combined forecast model</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Applications</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium min-w-[140px]">Analysis:</span>
                    <span className="text-blue-700 dark:text-blue-300">Dimensioning and risk management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium min-w-[140px]">Market:</span>
                    <span className="text-blue-700 dark:text-blue-300">Volatility regime analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium min-w-[140px]">Trading:</span>
                    <span className="text-blue-700 dark:text-blue-300">Timing of entry/exit</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Volatility Chart - Moved to top for immediate visibility */}
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Volatility Forecast Chart
          </h3>
          
          {/* Debug Info */}
          <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Client Side: {isClient.toString()}</p>
            <p>Loading: {loading.toString()}</p>
            <p>Error: {error || 'None'}</p>
            <p>Analysis Results: {analysisResults ? 'Available' : 'None'}</p>
            <p>Chart Data: {chartData ? 'Available' : 'None'}</p>
            <p>Selected Ticker: {selectedTicker}</p>
            <p>Vol Data Length: {volData.length}</p>
            {analysisResults && (
              <>
                <p>Data Length: {analysisResults.labels.length} points</p>
                <p>Sample Labels: {analysisResults.labels.slice(0, 3).join(', ')}</p>
                <p>Sample Historical: {analysisResults.historicalData.slice(-3).join(', ')}</p>
                <p>Sample Forecast: {analysisResults.forecastData.slice(-3).join(', ')}</p>
                <p>Historical Vol: {analysisResults.historicalVol}</p>
              </>
            )}
            {chartData && (
              <>
                <p>Chart Labels: {chartData.labels.length}</p>
                <p>Historical Dataset Length: {chartData.datasets[0].data.length}</p>
                <p>Forecast Dataset Length: {chartData.datasets[1].data.length}</p>
                <p>Ensemble Dataset Length: {chartData.datasets[2].data.length}</p>
                <p>Sample Chart Historical: {chartData.datasets[0].data.slice(-3).join(', ')}</p>
                <p>Sample Chart Forecast: {chartData.datasets[1].data.slice(-3).join(', ')}</p>
              </>
            )}
          </div>
          
          {loading && (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          {!loading && error && (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-2">Failed to load chart data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            </div>
          )}
          {!loading && !error && analysisResults && chartData && isClient && (
            <>
              <div className="h-[400px] mb-4">
                {(() => {
                  try {
                    return <Line data={chartData} options={chartOptions} />;
                  } catch (chartError) {
                    console.error('Chart rendering error:', chartError);
                    return (
                      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="text-center">
                          <p className="text-red-600 dark:text-red-400 mb-2">Chart rendering failed</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Check browser console for details</p>
                          <p className="text-xs text-gray-500 mt-2">Error: {String(chartError)}</p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Historical Volatility
                  </h4>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analysisResults.historicalVol?.toFixed(2) || '0.00'}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Forecast Volatility
                  </h4>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {(analysisResults.forecastData?.[analysisResults.forecastData.length - 1] || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            </>
          )}
          {!loading && !error && analysisResults && !isClient && (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">Loading chart...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Initializing client-side rendering</p>
              </div>
            </div>
          )}
          {!loading && !error && !analysisResults && (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">No data available</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Try refreshing the page</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <VolatilityThermometer
            data={volData}
          />

          <EventsCalendar
            ticker={selectedTicker}
            currentVol={latestData.impliedVol}
            ensembleVol={latestData.ensemble}
            events={events}
          />

          <PositionSizer
            ticker={selectedTicker}
            impliedVol={latestData.impliedVol}
            ensembleVol={latestData.ensemble}
            daysToExpiry={30}
          />

          <StrategySuggestions
            ticker={selectedTicker}
            spotPrice={spotPrice}
            impliedVol={latestData.impliedVol}
            ensembleVol={latestData.ensemble}
            hasUpcomingEvents={hasUpcomingEvents}
            daysToExpiry={30}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">VolTools™</span> · EP Analytics
        </span>
      </div>
    </Card>
  );
} 
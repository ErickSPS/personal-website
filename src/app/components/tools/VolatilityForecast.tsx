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
  const [tickerInput, setTickerInput] = useState('');
  const [timeframe, setTimeframe] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<VolatilityData | null>(null);
  const [selectedTicker, setSelectedTicker] = useState('SPY');
  const [customTicker, setCustomTicker] = useState('');
  const [isCustomTicker, setIsCustomTicker] = useState(false);
  const [showTickerInput, setShowTickerInput] = useState(false);

  useEffect(() => {
    // In a real implementation, this would fetch data from your API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mock data for demonstration
        const mockVolData: VolatilityMetrics[] = Array.from({ length: 30 }, (_, i) => ({
          rolling30d: 20 + Math.random() * 5,
          ewmaFast: 18 + Math.random() * 4,
          ensemble: 19 + Math.random() * 3,
          impliedVol: 22 + Math.random() * 4,
          timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        }));

        const mockEvents: MarketEvent[] = [
          {
            type: 'earnings',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            title: 'Reporte de Ganancias Q1',
            description: 'Reporte trimestral de ganancias',
            expectedVolImpact: 5,
            historicalAvgMove: 3.5,
          },
          {
            type: 'fomc',
            date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            title: 'Reunión FOMC',
            description: 'Decisión de tasas de interés',
            expectedVolImpact: 8,
            historicalAvgMove: 4.2,
          },
        ];

        setVolData(mockVolData);
        setEvents(mockEvents);
        setSpotPrice(400); // Mock spot price
        setLoading(false);
      } catch (error) {
        console.error('Error fetching volatility data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerInput) {
      setError('Please enter a ticker symbol');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching data for ${tickerInput}...`);
      const volResponse = await fetchVolatilityData(tickerInput);
      console.log('Raw API response:', volResponse);
      
      const result = processVolatilityData(volResponse);
      console.log('Processed data:', result);
      
      // Create properly formatted volatility metrics
      const metrics: VolatilityMetrics[] = result.labels.map((date: string, i: number) => ({
        rolling30d: result.historicalData[i] || 0,
        ewmaFast: result.forecastData[i] || 0,
        ensemble: result.ensembleForecastData[i] || 0,
        impliedVol: (volResponse.implied_vol && volResponse.implied_vol[i]) || 0,
        timestamp: date
      }));

      console.log('Created metrics:', metrics.slice(0, 5)); // Log first 5 entries
      
      setVolData(metrics);
      setAnalysisResults({
        historicalData: result.historicalData,
        forecastData: result.forecastData,
        labels: result.labels,
        historicalVol: result.historicalVol || 0
      });
      setLoading(false);
    } catch (err) {
      console.error('Error in handleAnalyze:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze volatility');
      setAnalysisResults(null);
      setLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleTickerSelect = (ticker: string) => {
    setSelectedTicker(ticker);
    setIsCustomTicker(false);
    setShowTickerInput(false);
    // Trigger data fetch for new ticker
    fetchData(ticker);
  };

  const handleCustomTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTicker) {
      setSelectedTicker(customTicker.toUpperCase());
      setIsCustomTicker(true);
      setShowTickerInput(false);
      // Trigger data fetch for custom ticker
      fetchData(customTicker.toUpperCase());
    }
  };

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
        ensemble: result.ensembleForecastData[i] || 0,
        impliedVol: (volResponse.implied_vol && volResponse.implied_vol[i]) || 0,
        timestamp: date
      }));

      console.log('Created metrics:', metrics.slice(0, 5)); // Log first 5 entries

      setVolData(metrics);
      setAnalysisResults({
        historicalData: result.historicalData,
        forecastData: result.forecastData,
        labels: result.labels,
        historicalVol: result.historicalVol || 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch volatility data');
      setAnalysisResults(null);
      setLoading(false);
    }
  };

  // Add this to your useEffect
  useEffect(() => {
    fetchData(selectedTicker);
  }, [selectedTicker]);

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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Volatility Analysis</h3>
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

      <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Volatility Forecast
        </h2>

        <form onSubmit={handleAnalyze} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Ticker
              </label>
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g. SPY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timeframe (Days)
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Volatility'}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {analysisResults && (
          <div>
            <div className="mb-6 h-[400px]">
              <Line data={chartData!} options={chartOptions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Historical Volatility
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {analysisResults.historicalVol.toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Forecast Volatility
                </h3>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {(analysisResults.forecastData[analysisResults.forecastData.length - 1] || 0).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">VolTools™</span> · EP Analytics
          </span>
        </div>
      </div>
    </Card>
  );
} 
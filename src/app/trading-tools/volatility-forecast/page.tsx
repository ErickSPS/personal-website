'use client';

import React, { useState, useEffect } from 'react';
import ClientLayout from '../../../components/ClientLayout';
import VolatilityForecast from '../../components/tools/VolatilityForecast';
import VolatilityThermometer from '../../components/tools/VolatilityThermometer';
import PositionSizer from '../../components/tools/PositionSizer';
import EventsCalendar from '../../components/tools/EventsCalendar';
import StrategySuggestions from '../../components/tools/StrategySuggestions';
import { DataDisclaimer } from '../../components/tools/DataDisclaimer';
import { fetchVolatilityData, processVolatilityData, fetchMarketEvents } from './volatility.service';


const DEFAULT_TICKERS = ['SPY', 'QQQ', 'IWM', 'DIA', 'VIX'];

// Default values for fallback
const DEFAULT_VALUES = {
  impliedVol: 20,
  ensembleVol: 22,
  spotPrice: 400,
  daysToExpiry: 30
};

export default function VolatilityForecastPage() {
  const [selectedTicker, setSelectedTicker] = useState('SPY');
  const [customTicker, setCustomTicker] = useState('');
  const [showTickerInput, setShowTickerInput] = useState(false);
  
  // Add state for volatility data
  const [volatilityData, setVolatilityData] = useState<any>(null);
  const [marketEvents, setMarketEvents] = useState<any[]>([]);
  const [spotPrice, setSpotPrice] = useState<number | null>(null);
  const [impliedVol, setImpliedVol] = useState<number | null>(null);
  const [ensembleVol, setEnsembleVol] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Fetch data when ticker changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setUseFallback(false);

      try {
        // Fetch volatility data first
        const volData = await fetchVolatilityData(selectedTicker);
        const processedData = processVolatilityData(volData);
        
        // Update volatility-related state
        setVolatilityData(processedData);
        setImpliedVol(processedData.modelPredictions?.implied || null);
        setEnsembleVol(processedData.modelPredictions?.ensemble || null);
        
        // Get spot price from the last valid data point
        const lastValidIndex = processedData.historicalData.length - 1;
        if (lastValidIndex >= 0) {
          setSpotPrice(processedData.historicalData[lastValidIndex] || null);
        }

        // Fetch market events in parallel
        const events = await fetchMarketEvents(selectedTicker);
        setMarketEvents(events);
      } catch (err) {
        console.error('Error fetching data:', err);
        
        // Determine the specific error
        let errorMessage = 'Failed to fetch market data. ';
        if (err instanceof Error) {
          if (err.message.includes('timeout')) {
            errorMessage += 'Request timed out. ';
          } else if (err.message.includes('CORS')) {
            errorMessage += 'CORS error. ';
          } else if (err.message.includes('rate limit')) {
            errorMessage += 'Rate limit exceeded. ';
          }
        }
        
        errorMessage += 'Using fallback data.';
        setError(errorMessage);
        setUseFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTicker]);

  const handleTickerSelect = (ticker: string) => {
    setSelectedTicker(ticker);
    setShowTickerInput(false);
  };

  const handleCustomTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTicker) {
      setSelectedTicker(customTicker.toUpperCase());
      setShowTickerInput(false);
      setCustomTicker('');
    }
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <DataDisclaimer />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Volatility Analysis Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Advanced volatility forecasting and trading strategy analysis
          </p>
        </div>

        {/* Ticker Selection */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Asset
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Currently analyzing: <span className="font-semibold text-primary dark:text-accent">{selectedTicker}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {DEFAULT_TICKERS.map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => handleTickerSelect(ticker)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTicker === ticker
                      ? 'bg-primary dark:bg-accent text-white shadow-sm dark:shadow-accent/20'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {ticker}
                </button>
              ))}
              <button
                onClick={() => setShowTickerInput(!showTickerInput)}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                + Custom
              </button>
            </div>

            {showTickerInput && (
              <form onSubmit={handleCustomTickerSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={customTicker}
                  onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                  placeholder="Enter ticker symbol..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={5}
                />
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                  Add
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volatility Forecast Charts */}
          <div className="lg:col-span-2">
            <VolatilityForecast
              ticker={selectedTicker}
            />
          </div>

          {/* Volatility Thermometer */}
          <div className="lg:col-span-2">
            <VolatilityThermometer ticker={selectedTicker} />
          </div>

          {/* Position Sizer */}
          <div>
            <PositionSizer
              ticker={selectedTicker}
              impliedVol={useFallback ? DEFAULT_VALUES.impliedVol : (impliedVol || 0)}
              ensembleVol={useFallback ? DEFAULT_VALUES.ensembleVol : (ensembleVol || 0)}
              daysToExpiry={DEFAULT_VALUES.daysToExpiry}
            />
          </div>

          {/* Strategy Suggestions */}
          <div>
            {isLoading ? (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-yellow-600 dark:text-yellow-400 mb-4">{error}</div>
                {useFallback && (
                  <StrategySuggestions
                    ticker={selectedTicker}
                    spotPrice={DEFAULT_VALUES.spotPrice}
                    impliedVol={DEFAULT_VALUES.impliedVol}
                    ensembleVol={DEFAULT_VALUES.ensembleVol}
                    hasUpcomingEvents={false}
                    daysToExpiry={DEFAULT_VALUES.daysToExpiry}
                  />
                )}
              </div>
            ) : (
              <StrategySuggestions
                ticker={selectedTicker}
                spotPrice={spotPrice || 0}
                impliedVol={impliedVol || 0}
                ensembleVol={ensembleVol || 0}
                hasUpcomingEvents={marketEvents.length > 0}
                daysToExpiry={DEFAULT_VALUES.daysToExpiry}
              />
            )}
          </div>

          {/* Events Calendar */}
          <div className="lg:col-span-2">
            <EventsCalendar
              ticker={selectedTicker}
              currentVol={useFallback ? DEFAULT_VALUES.impliedVol : (impliedVol || 0)}
              ensembleVol={useFallback ? DEFAULT_VALUES.ensembleVol : (ensembleVol || 0)}
              events={useFallback ? [] : marketEvents}
            />
          </div>
        </div>
        
        {/* Trademark */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">VolTools™</span> · EP Analytics
          </span>
        </div>
      </div>
    </ClientLayout>
  );
} 
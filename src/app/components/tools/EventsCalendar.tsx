import React, { useEffect, useState } from 'react';
import { DocumentChartBarIcon, BuildingLibraryIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { EventsCalendarProps, MarketEvent, MarketEventType } from '@/types/market-events';
import { fetchMarketEvents } from '../../trading-tools/volatility-forecast/volatility.service';

const getEventIcon = (type: MarketEventType) => {
  switch (type) {
    case 'earnings':
      return <DocumentChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    case 'fomc':
      return <BuildingLibraryIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
    case 'economic':
      return <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />;
    default:
      return <CalendarIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />;
  }
};

const getDaysUntil = (date: Date): number => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function EventsCalendar({
  className = '',
  ticker,
  currentVol,
  ensembleVol,
}: EventsCalendarProps) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const volSpread = currentVol - ensembleVol;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const marketEvents = await fetchMarketEvents(ticker);
        setEvents(marketEvents);
      } catch (error) {
        console.error('Error loading market events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [ticker]);

  if (loading) {
    return (
      <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No upcoming events scheduled</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Check back later for updates</p>
        </div>
      </div>
    );
  }

  // Group events by month
  const eventsByMonth = events.reduce((acc, event) => {
    const monthKey = event.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, MarketEvent[]>);

  return (
    <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Events Calendar</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Upcoming market events and volatility impact
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
          <div key={month} className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{month}</h4>
            {monthEvents.map((event, index) => {
              const daysUntil = getDaysUntil(event.date);
              const isNearTerm = daysUntil <= 7;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isNearTerm ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{getEventIcon(event.type)}</div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <span
                          className={`text-sm font-medium ${
                            isNearTerm
                              ? 'text-blue-800 dark:text-blue-300'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {event.date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Average Historical Move
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {event.historicalAvgMove.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Volatility Impact
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {event.expectedVolImpact.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {isNearTerm && (
                        <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/50 rounded">
                          <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Trading Recommendation
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                            {volSpread > 2
                              ? 'Consider reducing position size due to elevated implied volatility.'
                              : volSpread < -2
                              ? 'Consider increasing position size due to depressed implied volatility.'
                              : 'Maintain standard position sizing based on current volatility levels.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Event Risk Analysis</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Current ensemble forecast includes additional volatility buffer for upcoming events.
          Consider adjusting position sizes and hedging strategies as events approach.
        </p>
      </div>
    </div>
  );
} 
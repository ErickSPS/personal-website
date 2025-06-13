import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import { StrategySuggestionsProps, Strategy } from '@/types/volatility';

export default function StrategySuggestions({
  className = '',
  ticker,
  spotPrice,
  impliedVol,
  ensembleVol,
  hasUpcomingEvents,
  daysToExpiry,
}: StrategySuggestionsProps) {
  const volSpread = impliedVol - ensembleVol;
  const isHighSpread = Math.abs(volSpread) > 3;
  const isVolOverpriced = volSpread > 0;

  const getStrategies = (): Strategy[] => {
    const strategies: Strategy[] = [];

    if (hasUpcomingEvents) {
      // Event-driven strategies
      if (isVolOverpriced) {
        strategies.push({
          type: 'strangle',
          direction: 'long',
          strikes: [spotPrice * 0.95, spotPrice * 1.05],
          ratios: [1, 1],
          delta: [-0.2, 0.2],
          vega: 0.4,
          theta: -0.15,
          expectedReturn: impliedVol * 2,
          maxLoss: impliedVol * 0.5,
          breakeven: [-8, 8],
        });
      } else {
        strategies.push({
          type: 'callSpread',
          direction: 'long',
          strikes: [spotPrice, spotPrice * 1.05],
          ratios: [1, -1],
          delta: [0.5, -0.2],
          vega: 0.2,
          theta: -0.1,
          expectedReturn: impliedVol * 1.5,
          maxLoss: impliedVol * 0.3,
          breakeven: [3],
        });
      }
    } else if (isHighSpread) {
      // High vol spread strategies
      if (isVolOverpriced) {
        strategies.push({
          type: 'ironCondor',
          direction: 'short',
          strikes: [spotPrice * 0.9, spotPrice * 0.95, spotPrice * 1.05, spotPrice * 1.1],
          ratios: [-1, 1, -1, 1],
          delta: [0.1, -0.3, 0.3, -0.1],
          vega: -0.3,
          theta: 0.2,
          expectedReturn: impliedVol * 0.8,
          maxLoss: impliedVol * 2,
          breakeven: [-7, 7],
        });
      } else {
        strategies.push({
          type: 'butterfly',
          direction: 'long',
          strikes: [spotPrice * 0.95, spotPrice, spotPrice * 1.05],
          ratios: [1, -2, 1],
          delta: [-0.1, 0.2, -0.1],
          vega: 0.1,
          theta: -0.05,
          expectedReturn: impliedVol * 1.2,
          maxLoss: impliedVol * 0.4,
          breakeven: [-3, 3],
        });
      }
    } else {
      // Low vol spread - neutral strategies
      strategies.push({
        type: 'straddle',
        direction: isVolOverpriced ? 'short' : 'long',
        strikes: [spotPrice],
        ratios: [1],
        delta: [0],
        vega: isVolOverpriced ? -0.4 : 0.4,
        theta: isVolOverpriced ? 0.2 : -0.2,
        expectedReturn: impliedVol * (isVolOverpriced ? 0.7 : 1.3),
        maxLoss: impliedVol * (isVolOverpriced ? 2 : 1),
        breakeven: [-5, 5],
      });
    }

    return strategies;
  };

  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStrategyIcon = (strategy: Strategy) => {
    if (strategy.direction === 'long') {
      return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
    } else if (strategy.direction === 'short') {
      return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
    }
    return <MinusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
  };

  const strategies = getStrategies();

  return (
    <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Strategy Suggestions</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Optimal structures based on volatility analysis
        </p>
      </div>

      <div className="space-y-6">
        {strategies.map((strategy, index) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStrategyIcon(strategy)}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {strategy.direction} {strategy.type}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Strikes: {strategy.strikes.map(s => s.toFixed(2)).join(' / ')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Expected Return: {formatPercent(strategy.expectedReturn)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Max Loss: {formatPercent(strategy.maxLoss)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Delta:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-1">
                  {strategy.delta.map(d => formatPercent(d * 100)).join(' / ')}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Vega:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-1">{formatPercent(strategy.vega * 100)}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Theta:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-1">{formatPercent(strategy.theta * 100)}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Break-even:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-1">
                  ±{strategy.breakeven.map(b => Math.abs(b)).join('/')}%
                </span>
              </div>
            </div>

            <div className="mt-4 text-sm">
              <span className="font-medium text-gray-900 dark:text-white">Rationale: </span>
              <span className="text-gray-700 dark:text-gray-300">
                {hasUpcomingEvents && 'Structure adapted for upcoming events. '}
                {isHighSpread && (isVolOverpriced
                  ? 'Implied volatility significantly high - selling opportunity.'
                  : 'Implied volatility significantly low - buying opportunity.')}
                {!isHighSpread && 'Moderate volatility spread - focus on neutral strategies.'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-800 dark:text-blue-300">
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Considerations</h4>
        <ul className="space-y-2">
          <li>• Suggested strategies are based on the spread between implied vol ({impliedVol.toFixed(1)}%) and ensemble forecast ({ensembleVol.toFixed(1)}%).</li>
          <li>• Expected returns assume realized volatility converges to ensemble forecast.</li>
          <li>• Adjust position size according to your risk tolerance and available capital.</li>
        </ul>
      </div>
    </div>
  );
} 
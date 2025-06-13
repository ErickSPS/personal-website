import React, { useState, useEffect } from 'react';
import { PositionSizerProps, PositionSuggestion } from '@/types/volatility';

export default function PositionSizer({
  className = '',
  ticker,
  impliedVol,
  ensembleVol,
  daysToExpiry,
}: Omit<PositionSizerProps, 'accountSize'>) {
  const [riskPercent, setRiskPercent] = useState(2); // Default 2% risk
  const [accountSize, setAccountSize] = useState(100000); // Default $100,000
  const [suggestion, setSuggestion] = useState<PositionSuggestion | null>(null);
  const volSpread = impliedVol - ensembleVol;

  useEffect(() => {
    // Calculate position suggestion whenever inputs change
    calculatePositionSuggestion();
  }, [accountSize, impliedVol, ensembleVol, daysToExpiry, riskPercent]);

  const handleAccountSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAccountSize(parseInt(value) || 0);
  };

  const calculatePositionSuggestion = () => {
    const riskAmount = (accountSize * riskPercent) / 100;
    
    // Simple position sizing calculation
    // In reality, this would be much more sophisticated with actual options pricing
    const vegaTarget = riskAmount / Math.abs(volSpread);
    const contractSize = Math.floor(vegaTarget / 100); // Simplified vega per contract

    let suggestion: PositionSuggestion;

    if (Math.abs(volSpread) < 2) {
      // Low vol spread - suggest iron condor
      suggestion = {
        type: 'ironCondor',
        contracts: Math.max(1, Math.floor(contractSize / 2)),
        expectedReturn: riskAmount * 0.5,
        maxLoss: riskAmount,
        breakeven: [-5, 5], // Simplified breakeven points
        vegaExposure: contractSize * 100,
      };
    } else if (volSpread > 2) {
      // IV much higher than forecast - suggest selling straddle
      suggestion = {
        type: 'straddle',
        contracts: Math.max(1, contractSize),
        expectedReturn: riskAmount * 0.8,
        maxLoss: riskAmount * 2,
        breakeven: [-10, 10],
        vegaExposure: contractSize * 100,
      };
    } else {
      // IV much lower than forecast - suggest buying strangle
      suggestion = {
        type: 'strangle',
        contracts: Math.max(1, Math.floor(contractSize * 0.7)),
        expectedReturn: riskAmount * 1.2,
        maxLoss: riskAmount,
        breakeven: [-15, 15],
        vegaExposure: contractSize * 70,
      };
    }

    setSuggestion(suggestion);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`${className} p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Position Sizer</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Risk-based position sizing calculator
        </p>
      </div>

      <div className="space-y-6">
        {/* Portfolio Size Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Portfolio Size
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="text"
              value={accountSize.toLocaleString()}
              onChange={handleAccountSizeChange}
              className="block w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent"
              placeholder="Enter portfolio size..."
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your total portfolio value
          </p>
        </div>

        {/* Risk Percentage Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Risk per Trade ({riskPercent}% = {formatCurrency(accountSize * riskPercent / 100)})
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={riskPercent}
            onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0.5%</span>
            <span>2.5%</span>
            <span>5%</span>
          </div>
        </div>

        {suggestion && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggested Structure</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                  {suggestion.type} × {suggestion.contracts}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Vega Exposure: {suggestion.vegaExposure.toFixed(0)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Capital at Risk</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(accountSize * riskPercent / 100)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {riskPercent}% of total capital
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Risk/Return Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Expected Return:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">
                    {formatCurrency(suggestion.expectedReturn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Maximum Loss:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">
                    {formatCurrency(suggestion.maxLoss)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Break-even Points:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">
                    ±{suggestion.breakeven[0]}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rationale</h4>
              <p>
                {volSpread > 2 && 'Implied volatility is significantly above ensemble forecast, suggesting a selling opportunity.'}
                {volSpread < -2 && 'Implied volatility is significantly below ensemble forecast, suggesting a buying opportunity.'}
                {Math.abs(volSpread) <= 2 && 'Implied volatility is close to ensemble forecast, suggesting a neutral strategy with limited income.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
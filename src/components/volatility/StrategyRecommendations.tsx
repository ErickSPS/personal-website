import React from 'react';
import { StrategyRecommendation } from '@/types/volatility.types';

interface StrategyRecommendationsProps {
  recommendations: StrategyRecommendation[];
}

export default function StrategyRecommendations({ recommendations }: StrategyRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-secondary dark:text-secondary-light">
          No strategy recommendations available. Try adjusting your parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-primary dark:text-primary-light">
        Strategy Recommendations
      </h2>
      
      <div className="grid gap-6">
        {recommendations.map((rec, index) => (
          <div key={index} className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary dark:text-primary-light">
                {rec.name}
              </h3>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {rec.risk}
              </span>
            </div>
            
            <p className="text-secondary dark:text-secondary-light mb-4">
              {rec.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-primary dark:text-primary-light">Potential Return:</span>
                <span className="ml-2 text-secondary dark:text-secondary-light">{rec.potentialReturn}</span>
              </div>
              <div>
                <span className="font-medium text-primary dark:text-primary-light">Max Loss:</span>
                <span className="ml-2 text-secondary dark:text-secondary-light">{rec.maxLoss}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium text-primary dark:text-primary-light">Setup: </span>
              <span className="text-secondary dark:text-secondary-light">{rec.setup}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
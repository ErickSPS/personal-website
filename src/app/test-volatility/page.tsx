'use client';

import React, { useState, useEffect } from 'react';

interface TestResult {
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp: string;
}

export default function TestVolatilityPage() {
  const [testResult, setTestResult] = useState<TestResult>({
    status: 'loading',
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const testAPI = async () => {
      try {
        setTestResult({ status: 'loading', timestamp: new Date().toISOString() });
        
        console.log('Testing API call...');
        const response = await fetch('/api/volatility/forecast?ticker=SPY');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        const summary = {
          labelsCount: data.labels?.length || 0,
          historicalDataCount: data.historicalData?.length || 0,
          historicalNonNullCount: data.historicalData?.filter((x: any) => x !== null).length || 0,
          forecastDataCount: data.forecastData?.length || 0,
          ensembleDataCount: data.ensembleForecastData?.length || 0,
          impliedVolValue: data.impliedVol?.[data.impliedVol.length - 1] || null,
          sampleHistoricalData: data.historicalData?.slice(-5) || [],
          sampleForecastData: data.forecastData?.slice(-5) || []
        };
        
        setTestResult({
          status: 'success',
          data: { summary, raw: data },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('API Test Error:', error);
        setTestResult({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    };

    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Volatility API Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              testResult.status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
              testResult.status === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {testResult.status.toUpperCase()}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-4">
              {testResult.timestamp}
            </span>
          </div>

          {testResult.status === 'loading' && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Testing API...</span>
            </div>
          )}

          {testResult.status === 'error' && (
            <div className="text-red-600 dark:text-red-400">
              <h3 className="font-medium mb-2">Error occurred:</h3>
              <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded text-sm overflow-x-auto">
                {testResult.error}
              </pre>
            </div>
          )}

          {testResult.status === 'success' && testResult.data && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                API Response Summary:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                  <h4 className="font-medium mb-2">Data Counts:</h4>
                  <ul className="text-sm space-y-1">
                    <li>Labels: {testResult.data.summary.labelsCount}</li>
                    <li>Historical Data: {testResult.data.summary.historicalDataCount}</li>
                    <li>Historical Non-null: {testResult.data.summary.historicalNonNullCount}</li>
                    <li>Forecast Data: {testResult.data.summary.forecastDataCount}</li>
                    <li>Ensemble Data: {testResult.data.summary.ensembleDataCount}</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                  <h4 className="font-medium mb-2">Sample Data:</h4>
                  <div className="text-sm space-y-1">
                    <div>Implied Vol: {testResult.data.summary.impliedVolValue || 'null'}</div>
                    <div>Last Historical: {testResult.data.summary.sampleHistoricalData.slice(-1)[0] || 'null'}</div>
                    <div>Last Forecast: {testResult.data.summary.sampleForecastData.slice(-1)[0] || 'null'}</div>
                  </div>
                </div>
              </div>

              <details className="mb-4">
                <summary className="cursor-pointer font-medium text-blue-600 dark:text-blue-400">
                  View Sample Historical Data (Last 5)
                </summary>
                <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded text-sm mt-2 overflow-x-auto">
                  {JSON.stringify(testResult.data.summary.sampleHistoricalData, null, 2)}
                </pre>
              </details>

              <details className="mb-4">
                <summary className="cursor-pointer font-medium text-blue-600 dark:text-blue-400">
                  View Sample Forecast Data (Last 5)
                </summary>
                <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded text-sm mt-2 overflow-x-auto">
                  {JSON.stringify(testResult.data.summary.sampleForecastData, null, 2)}
                </pre>
              </details>

              <details>
                <summary className="cursor-pointer font-medium text-blue-600 dark:text-blue-400">
                  View Full Raw Response
                </summary>
                <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded text-sm mt-2 overflow-x-auto max-h-64">
                  {JSON.stringify(testResult.data.raw, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Refresh Test
          </button>
        </div>
      </div>
    </div>
  );
} 
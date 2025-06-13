'use client';

import React from 'react';
import Link from 'next/link';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';

export default function TradingTools() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Trading Tools
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Professional-grade tools for market analysis and trading decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/trading-tools/volatility-forecast"
            className="card card-hover group"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Volatility Forecast
                </h3>
                <p className="text-secondary text-sm mb-4 leading-relaxed">
                  Advanced volatility analysis and options strategy recommendations based on market conditions
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
} 
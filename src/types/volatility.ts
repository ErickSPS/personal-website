export interface VolatilityData {
  timestamp: string;
  rolling30d: number;
  ewmaFast: number;
  ensemble: number;
  impliedVol: number;
}

export interface VolatilityMetrics {
  timestamp: string;
  rolling30d: number;
  ewmaFast: number;
  ensemble: number;
  impliedVol: number;
}

export interface VolatilityThermometerProps {
  className?: string;
  data?: VolatilityMetrics[];
  ticker?: string;
}

export interface PositionSizerProps {
  className?: string;
  accountSize: number;
  ticker: string;
  impliedVol: number;
  ensembleVol: number;
  daysToExpiry: number;
}

export interface PositionSuggestion {
  type: 'ironCondor' | 'straddle' | 'strangle';
  contracts: number;
  expectedReturn: number;
  maxLoss: number;
  breakeven: number[];
  vegaExposure: number;
}

export interface StrategySuggestionsProps {
  className?: string;
  ticker: string;
  spotPrice: number;
  impliedVol: number;
  ensembleVol: number;
  hasUpcomingEvents: boolean;
  daysToExpiry: number;
}

export interface Strategy {
  type: string;
  direction: 'long' | 'short';
  strikes: number[];
  ratios: number[];
  delta: number[];
  vega: number;
  theta: number;
  expectedReturn: number;
  maxLoss: number;
  breakeven: number[];
} 
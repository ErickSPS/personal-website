export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface MarketAnalysis {
  currentIV: number;
  forecastedVol: number;
  volSpread: number;
  smileFlattness: number;
  marketCondition: string;
  directionalBias: 'bullish' | 'bearish' | 'neutral';
}

export interface StrategyRecommendation {
  name: string;
  description: string;
  risk: string;
  potentialReturn: string;
  maxLoss: string;
  setup: string;
}

export interface MarketData {
  prices: number[];
  dates: string[];
}

export interface VolatilityResult {
  historicalData: number[];
  forecastData: number[];
  labels: string[];
  historicalVol: number;
} 
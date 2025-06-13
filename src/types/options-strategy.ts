export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface StrategyPayoff {
  maxGain: number;
  maxLoss: number;
  breakeven: number | number[];
  vega?: number;
  delta?: number;
}

export interface OptionsStrategy {
  type: 'iron_condor' | 'butterfly' | 'directional_spread' | 'straddle_strangle';
  name: string;
  description: string;
  setup: string;
  payoff: StrategyPayoff;
  conditions: {
    impliedVol: number;
    forecastVol: number;
    volSpread: number;
    smileFlattness?: number;
    directionalBias?: 'bullish' | 'bearish' | 'neutral';
  };
}

export interface StrategyRecommendation {
  strategy: OptionsStrategy;
  confidence: number;
  additionalNotes?: string;
  payoffChart?: string; // URL or data for chart
}

export interface VolatilityAnalysis {
  currentIV: number;
  forecastedVol: number;
  volSpread: number;
  smileFlattness: number;
  marketCondition: string;
  directionalBias: 'bullish' | 'bearish' | 'neutral';
} 
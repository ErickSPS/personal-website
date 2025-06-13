export type MarketCondition = 'normal' | 'high_volatility' | 'low_volatility' | 'trending';
export type DirectionalBias = 'neutral' | 'bullish' | 'bearish';

export interface VolatilityAnalysis {
  currentIV: number;
  forecastedVol: number;
  volSpread: number;
  directionalBias: DirectionalBias;
  smileFlattness: number;
  marketCondition: MarketCondition;
}

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive'; 
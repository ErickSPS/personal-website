import {
  generateIronCondorStrategy,
  generateVolatilityButterfly,
  generateDirectionalSpread,
  generateStraddle,
  getStrategyRecommendations,
} from '../options-strategy';
import { VolatilityAnalysis } from '@/types/volatility-analysis';

describe('options-strategy service', () => {
  const mockAnalysis: VolatilityAnalysis = {
    currentIV: 20,
    forecastedVol: 18,
    volSpread: 2,
    directionalBias: 'neutral',
    smileFlattness: 0.9,
    marketCondition: 'normal',
  };

  const spotPrice = 400;
  const riskProfile = 'moderate' as const;

  describe('generateIronCondorStrategy', () => {
    it('generates correct iron condor strategy', () => {
      const strategy = generateIronCondorStrategy(mockAnalysis, spotPrice, riskProfile);
      expect(strategy.type).toBe('iron_condor');
      expect(strategy.direction).toBe('short');
      expect(strategy.strikes.length).toBe(4);
      expect(strategy.ratios).toEqual([-1, 1, -1, 1]);
    });
  });

  describe('generateVolatilityButterfly', () => {
    it('generates correct butterfly strategy', () => {
      const strategy = generateVolatilityButterfly(mockAnalysis, spotPrice);
      expect(strategy.type).toBe('butterfly');
      expect(strategy.direction).toBe('long');
      expect(strategy.strikes.length).toBe(3);
      expect(strategy.ratios).toEqual([1, -2, 1]);
    });
  });

  describe('generateDirectionalSpread', () => {
    it('generates correct directional spread strategy', () => {
      const strategy = generateDirectionalSpread(mockAnalysis, spotPrice, riskProfile);
      expect(strategy.type).toBe('directional_spread');
      expect(strategy.direction).toBe('long');
      expect(strategy.strikes.length).toBe(2);
      expect(strategy.ratios).toEqual([1, -1]);
    });
  });

  describe('generateStraddle', () => {
    it('generates correct straddle strategy', () => {
      const strategy = generateStraddle(mockAnalysis, spotPrice);
      expect(strategy.type).toBe('straddle_strangle');
      expect(strategy.direction).toBe('short');
      expect(strategy.strikes.length).toBe(1);
      expect(strategy.ratios).toEqual([1]);
    });
  });

  describe('getStrategyRecommendations', () => {
    it('returns recommendations sorted by confidence', () => {
      const recommendations = getStrategyRecommendations(mockAnalysis, spotPrice, riskProfile);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].confidence).toBeGreaterThanOrEqual(
        recommendations[recommendations.length - 1].confidence
      );
    });

    it('includes appropriate strategies based on market conditions', () => {
      const highVolAnalysis: VolatilityAnalysis = {
        ...mockAnalysis,
        volSpread: 6,
        directionalBias: 'bullish',
        marketCondition: 'high_volatility',
      };
      const recommendations = getStrategyRecommendations(highVolAnalysis, spotPrice, riskProfile);
      expect(recommendations.some(r => r.strategy.type === 'straddle_strangle')).toBe(true);
    });
  });
}); 
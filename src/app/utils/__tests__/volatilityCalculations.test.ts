import { calculateHistoricalVolatility, calculateEWMAVolatility, calculateEnsembleVolatility } from '../volatilityCalculations';

describe('Volatility Calculations', () => {
  const samplePrices = [100, 102, 99, 101, 103, 98, 100, 102, 101, 99];
  const sampleReturns = samplePrices.slice(1).map((price, i) => 
    Math.log(price / samplePrices[i])
  );

  describe('Historical Volatility', () => {
    it('should calculate historical volatility correctly', () => {
      const result = calculateHistoricalVolatility(samplePrices, 5); // Use smaller window for test data
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(samplePrices.length);
      
      // Check that we have some valid (non-NaN) volatility values
      const validVols = result.filter((v: number) => !isNaN(v));
      expect(validVols.length).toBeGreaterThan(0);
      
      // Check that valid volatility values are positive
      validVols.forEach((vol: number) => {
        expect(vol).toBeGreaterThan(0);
      });
    });

    it('should handle empty array', () => {
      expect(() => calculateHistoricalVolatility([])).toThrow();
    });

    it('should return correct array length', () => {
      const result = calculateHistoricalVolatility(samplePrices, 3);
      expect(result.length).toBe(samplePrices.length);
    });
  });

  describe('EWMA Volatility', () => {
    it('should calculate EWMA volatility correctly', () => {
      const result = calculateEWMAVolatility(samplePrices, 0.94);
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
      expect(Number.isNaN(result)).toBe(false);
    });

    it('should handle empty array', () => {
      expect(() => calculateEWMAVolatility([], 0.94)).toThrow();
    });

    it('should handle invalid lambda', () => {
      expect(() => calculateEWMAVolatility(samplePrices, 1.5)).toThrow();
      expect(() => calculateEWMAVolatility(samplePrices, -0.5)).toThrow();
    });
  });

  describe('Ensemble Volatility', () => {
    it('should calculate ensemble volatility correctly', () => {
      const result = calculateEnsembleVolatility(samplePrices);
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
      expect(Number.isNaN(result)).toBe(false);
    });

    it('should handle empty array', () => {
      expect(() => calculateEnsembleVolatility([])).toThrow();
    });
  });
}); 
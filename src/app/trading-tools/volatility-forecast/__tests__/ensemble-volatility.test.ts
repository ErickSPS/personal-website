import { calculateEnsembleVolatility, EnsembleVolatilityResult } from '../volatility.service';

describe('Ensemble Volatility Forecast', () => {
  const mockPrices = [100, 101, 99, 102, 98, 103, 97, 104, 96, 105];
  
  test('should calculate ensemble volatility forecast', () => {
    const result = calculateEnsembleVolatility(mockPrices);
    expect(result).toHaveProperty('ensembleForecast');
    expect(result.ensembleForecast).toBeInstanceOf(Array);
    expect(result.ensembleForecast).toHaveLength(8); // 8 forecast points
    expect(result.ensembleForecast.every((v: number) => typeof v === 'number')).toBe(true);
  });

  test('should include multiple model predictions', () => {
    const result = calculateEnsembleVolatility(mockPrices);
    expect(result).toHaveProperty('modelPredictions');
    expect(result.modelPredictions).toHaveProperty('garch');
    expect(result.modelPredictions).toHaveProperty('ewma');
    expect(result.modelPredictions).toHaveProperty('parkinson');
  });

  test('should handle insufficient data', () => {
    expect(() => calculateEnsembleVolatility([100])).toThrow('Insufficient price data');
  });

  test('should handle invalid input', () => {
    expect(() => calculateEnsembleVolatility([])).toThrow('Insufficient price data');
    expect(() => calculateEnsembleVolatility([NaN, 100, 101])).toThrow('Invalid price data');
  });

  test('should produce reasonable volatility estimates', () => {
    const result = calculateEnsembleVolatility(mockPrices);
    // Volatility should be positive and within reasonable bounds (e.g., 1% to 100%)
    expect(result.ensembleForecast[0]).toBeGreaterThan(1);
    expect(result.ensembleForecast[0]).toBeLessThan(100);
    
    // All models should produce similar magnitude estimates
    const { garch, ewma, parkinson } = result.modelPredictions;
    expect(Math.abs(garch - ewma)).toBeLessThan(20); // Within 20 percentage points
    expect(Math.abs(garch - parkinson)).toBeLessThan(20);
    expect(Math.abs(ewma - parkinson)).toBeLessThan(20);
  });

  test('should weight models appropriately', () => {
    const result = calculateEnsembleVolatility(mockPrices);
    const { garch, ewma, parkinson } = result.modelPredictions;
    const ensembleAvg = result.ensembleForecast[0];
    
    // Ensemble forecast should be between min and max of individual models
    const minModel = Math.min(garch, ewma, parkinson);
    const maxModel = Math.max(garch, ewma, parkinson);
    expect(ensembleAvg).toBeGreaterThanOrEqual(minModel);
    expect(ensembleAvg).toBeLessThanOrEqual(maxModel);
  });
}); 
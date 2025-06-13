import { fetchMarketData, calculateVolatility, VolatilityConfig } from '../volatility.service';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { HttpResponseResolver, PathParams, DefaultBodyType, JsonBodyType } from 'msw';

const server = setupServer(
  http.get('http://localhost:3000/api/yahoo-finance', ((req, res, ctx) => {
    const url = new URL(req.url);
    const ticker = url.searchParams.get('ticker');
    const timeframe = url.searchParams.get('timeframe');

    if (ticker === 'SPY' && timeframe === '10') {
      return HttpResponse.json({
        prices: [100, 101, 99, 102, 98, 103, 97, 104, 96, 105],
        timestamps: Array.from({ length: 10 }, (_, i) => 
          new Date(2024, 4, 19 + i).toISOString()
        ),
      });
    }

    return new HttpResponse(null, { status: 404 });
  }) as HttpResponseResolver<PathParams, DefaultBodyType, JsonBodyType>)
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Volatility Forecast Service', () => {
  describe('fetchMarketData', () => {
    it('should fetch and parse market data correctly', async () => {
      const result = await fetchMarketData('SPY', 10);
      expect(result.prices).toHaveLength(10);
      expect(result.timestamps).toHaveLength(10);
      expect(result.prices[0]).toBe(100);
    });

    it('should handle invalid data format', async () => {
      server.use(
        http.get('http://localhost:3000/api/yahoo-finance', () => {
          return HttpResponse.json({ invalid: 'data' });
        })
      );
      
      await expect(fetchMarketData('SPY', 10)).rejects.toThrow('Invalid data format');
    });

    it('should handle API errors', async () => {
      server.use(
        http.get('http://localhost:3000/api/yahoo-finance', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      
      await expect(fetchMarketData('SPY', 10)).rejects.toThrow();
    });
  });

  describe('calculateVolatility', () => {
    it('should calculate historical and forecast volatility correctly', () => {
      const prices = [100, 101, 99, 102, 98, 103, 97, 104, 96, 105];
      const result = calculateVolatility(prices);

      expect(result.historicalData).toHaveLength(10);
      expect(result.forecastData).toHaveLength(18);
      expect(result.labels).toHaveLength(18);
      expect(result.historicalVol).toBeGreaterThan(0);
    });

    it('should handle insufficient data', () => {
      const prices = [100];
      expect(() => calculateVolatility(prices)).toThrow('Insufficient price data');
    });

    it('should handle valid data with expected output format', () => {
      const prices = [100, 101, 99, 102, 98, 103, 97, 104, 96, 105];
      const result = calculateVolatility(prices);

      expect(result).toEqual(
        expect.objectContaining({
          historicalData: expect.any(Array),
          forecastData: expect.any(Array),
          labels: expect.any(Array),
          historicalVol: expect.any(Number),
        })
      );

      // Check data alignment
      expect(result.historicalData.length).toBe(prices.length);
      expect(result.forecastData.length).toBe(result.labels.length);
      expect(result.forecastData.slice(0, prices.length).every((v: number | null) => v === null)).toBe(true);
      expect(result.forecastData.slice(prices.length).every((v: number | null) => typeof v === 'number')).toBe(true);
    });
  });

  describe('Volatility Calculation', () => {
    const mockPrices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.5) * 5);

    test('should handle default window configuration', () => {
      const result = calculateVolatility(mockPrices);
      expect(result.historicalData).toHaveLength(10); // Default historical window
      expect(result.forecastData).toHaveLength(18); // historical + forecast
      expect(result.labels).toHaveLength(18); // Total window length
    });

    test('should respect custom window configuration', () => {
      const config: VolatilityConfig = {
        historicalWindow: 15,
        forecastWindow: 5
      };
      const result = calculateVolatility(mockPrices, config);
      
      expect(result.historicalData).toHaveLength(15);
      expect(result.forecastData).toHaveLength(20); // 15 + 5
      expect(result.labels).toHaveLength(20);
      
      // Check forecast data structure
      const nonNullForecast = result.forecastData.filter(x => x !== null);
      expect(nonNullForecast).toHaveLength(5);
    });

    test('should maintain continuous data points', () => {
      const config: VolatilityConfig = {
        historicalWindow: 5,
        forecastWindow: 3
      };
      const result = calculateVolatility(mockPrices, config);
      
      // Last historical point should be the basis for forecast
      const lastHistorical = result.historicalData[result.historicalData.length - 1];
      const firstForecast = result.forecastData.find(x => x !== null);
      expect(Math.abs(lastHistorical - firstForecast!)).toBeLessThan(5); // Allow small variation
    });

    test('should generate correct date labels', () => {
      const config: VolatilityConfig = {
        historicalWindow: 3,
        forecastWindow: 2
      };
      const result = calculateVolatility(mockPrices, config);
      
      expect(result.labels).toHaveLength(5);
      result.labels.forEach(label => {
        expect(label).toMatch(/[A-Za-z]{3} \d{1,2}/); // Format: "MMM DD"
      });
      
      // Ensure labels are in chronological order
      const dates = result.labels.map(label => new Date(label + ", 2024"));
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i].getTime()).toBeGreaterThan(dates[i-1].getTime());
      }
    });

    test('should handle minimum data requirements', () => {
      const config: VolatilityConfig = {
        historicalWindow: 2,
        forecastWindow: 1
      };
      
      // Should work with minimum data
      expect(() => calculateVolatility([100, 101], config)).not.toThrow();
      
      // Should throw with insufficient data
      expect(() => calculateVolatility([100], config)).toThrow('Insufficient price data');
    });

    test('should validate window configuration', () => {
      // Test invalid configurations
      const invalidConfigs: VolatilityConfig[] = [
        { historicalWindow: 0, forecastWindow: 5 },
        { historicalWindow: 5, forecastWindow: 0 },
        { historicalWindow: -1, forecastWindow: 5 },
        { historicalWindow: 5, forecastWindow: -1 }
      ];
      
      invalidConfigs.forEach(config => {
        expect(() => calculateVolatility(mockPrices, config)).toThrow('Invalid window configuration');
      });
    });
  });
}); 
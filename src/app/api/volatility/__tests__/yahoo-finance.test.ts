import { fetchOptionsData, findAtmOptions } from '../yahoo-finance';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock timers
jest.useFakeTimers();

describe('Yahoo Finance Options Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('fetchOptionsData', () => {
    const expectedHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://finance.yahoo.com',
      'Referer': 'https://finance.yahoo.com'
    };

    it('should fetch and return implied volatility for SPY', async () => {
      const mockResponse = {
        data: {
          optionChain: {
            result: [{
              quote: {
                regularMarketPrice: 420.69
              },
              options: [{
                calls: [
                  { strike: 420, impliedVolatility: 0.2, lastPrice: 5.0 },
                  { strike: 421, impliedVolatility: 0.21, lastPrice: 4.5 },
                ],
                puts: [
                  { strike: 420, impliedVolatility: 0.22, lastPrice: 4.8 },
                  { strike: 421, impliedVolatility: 0.23, lastPrice: 5.2 },
                ],
                expirationDate: 1683849600
              }]
            }]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      // Start the async operation
      const resultPromise = fetchOptionsData('SPY');
      
      // Fast-forward through the delay
      jest.advanceTimersByTime(2000);
      
      // Wait for the promise to resolve
      const result = await resultPromise;
      
      expect(result).not.toBeNull();
      expect(result).toBeGreaterThan(0);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://query1.finance.yahoo.com/v7/finance/options/SPY',
        { headers: expectedHeaders }
      );
    });

    it('should handle missing or invalid data', async () => {
      const mockResponse = {
        data: {
          optionChain: {
            result: []
          }
        }
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const resultPromise = fetchOptionsData('SPY');
      jest.advanceTimersByTime(2000);
      const result = await resultPromise;
      
      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const resultPromise = fetchOptionsData('SPY');
      jest.advanceTimersByTime(2000);
      const result = await resultPromise;
      
      expect(result).toBeNull();
    });

    it('should use cached data when available', async () => {
      const mockResponse = {
        data: {
          optionChain: {
            result: [{
              quote: {
                regularMarketPrice: 420.69
              },
              options: [{
                calls: [
                  { strike: 420, impliedVolatility: 0.2 },
                  { strike: 421, impliedVolatility: 0.21 }
                ],
                puts: [
                  { strike: 420, impliedVolatility: 0.22 },
                  { strike: 421, impliedVolatility: 0.23 }
                ],
                expirationDate: 1683849600
              }]
            }]
          }
        }
      };

      // First call
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      const resultPromise1 = fetchOptionsData('SPY');
      jest.advanceTimersByTime(2000);
      const result1 = await resultPromise1;

      // Second call should use cache (no delay needed)
      const result2 = await fetchOptionsData('SPY');
      expect(result1).toEqual(result2);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Should still be 1 because we used cache

      // Advance time beyond cache duration
      jest.advanceTimersByTime(61 * 1000); // 61 seconds (cache duration + 1s)

      // Third call should make a new request
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      const resultPromise3 = fetchOptionsData('SPY');
      jest.advanceTimersByTime(2000);
      await resultPromise3;
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAtmOptions', () => {
    const mockOptions = {
      calls: [
        { strike: 415, impliedVolatility: 0.2 },
        { strike: 420, impliedVolatility: 0.21 },
        { strike: 425, impliedVolatility: 0.22 }
      ],
      puts: [
        { strike: 415, impliedVolatility: 0.19 },
        { strike: 420, impliedVolatility: 0.20 },
        { strike: 425, impliedVolatility: 0.21 }
      ]
    };

    it('should find ATM options within threshold', () => {
      const result = findAtmOptions(mockOptions, 420, 0.05);
      expect(result).toEqual({
        call: { strike: 420, impliedVolatility: 0.21 },
        put: { strike: 420, impliedVolatility: 0.20 }
      });
    });

    it('should return null if no ATM options found', () => {
      const result = findAtmOptions(mockOptions, 450, 0.01);
      expect(result).toBeNull();
    });
  });
}); 
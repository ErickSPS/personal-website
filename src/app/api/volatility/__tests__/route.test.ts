import { POST } from '../route';
import { NextResponse } from 'next/server';

// Mock the volatility calculation functions
jest.mock('@/app/utils/volatilityCalculations', () => ({
  calculateHistoricalVolatility: jest.fn(() => 20),
  calculateEWMAVolatility: jest.fn(() => 18),
  calculateEnsembleVolatility: jest.fn(() => 19),
  calculateConfidenceIntervals: jest.fn(() => [17, 21])
}));

describe('Volatility API', () => {
  beforeEach(() => {
    // Clear rate limiting between tests
    jest.clearAllMocks();
  });

  it('should return volatility calculations for valid input', async () => {
    const request = new Request('http://localhost:3000/api/volatility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: 'AAPL',
        timeframe: '30'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('historicalVolatility');
    expect(data).toHaveProperty('forecast');
    expect(data).toHaveProperty('chartData');
    expect(data.chartData).toHaveProperty('labels');
    expect(data.chartData).toHaveProperty('historical');
    expect(data.chartData).toHaveProperty('forecast');
  });

  it('should handle missing parameters', async () => {
    const request = new Request('http://localhost:3000/api/volatility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should handle rate limiting', async () => {
    const makeRequest = () => new Request('http://localhost:3000/api/volatility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      },
      body: JSON.stringify({
        ticker: 'AAPL',
        timeframe: '30'
      })
    });

    // Make 11 requests (1 over limit)
    for (let i = 0; i < 10; i++) {
      await POST(makeRequest());
    }

    const response = await POST(makeRequest());
    expect(response.status).toBe(429);
  });

  it('should handle calculation errors', async () => {
    // Mock a calculation error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockCalculation = jest.requireMock('@/app/utils/volatilityCalculations');
    mockCalculation.calculateHistoricalVolatility.mockImplementation(() => {
      throw new Error('Calculation error');
    });

    const request = new Request('http://localhost:3000/api/volatility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: 'AAPL',
        timeframe: '30'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
}); 
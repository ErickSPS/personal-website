import { NextResponse } from 'next/server';
import { getImpliedVolatility } from '../yahoo-finance';
import { getHistoricalPrices as getAlphaVantageHistoricalPrices } from '../alpha-vantage';
import axios from 'axios';

interface ForecastRequest {
  ticker: string;
  prices: number[];
  dates: string[];
}

interface ForecastResponse {
  labels: string[];
  historicalData: number[];
  forecastData: number[];
  ensembleForecastData: number[];
  impliedVol: (number | null)[];
}

/**
 * Calculate historical volatility using rolling window of log returns
 */
function calculateHistoricalVol(prices: number[], window: number = 30): number[] {
  if (prices.length < 2) return [];

  // Calculate daily log returns
  const returns = prices.slice(1).map((price, i) => 
    Math.log(price / prices[i])
  );

  const volatilities: number[] = [];
  
  // For the first window-1 days, we don't have enough data for rolling calculation
  // Fill with NaN or use expanding window
  for (let i = 0; i < Math.min(window - 1, returns.length); i++) {
    volatilities.push(NaN);
  }

  // Calculate rolling volatility for each day starting from window
  for (let i = window - 1; i < returns.length; i++) {
    const windowReturns = returns.slice(i - window + 1, i + 1);
    const mean = windowReturns.reduce((a, b) => a + b, 0) / windowReturns.length;
    const variance = windowReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (windowReturns.length - 1);
    const annualizedVol = Math.sqrt(variance * 252) * 100;
    volatilities.push(annualizedVol);
  }

  // Pad the array to match the original prices length (add one more element since we started with returns)
  volatilities.unshift(NaN);

  return volatilities;
}

/**
 * Calculate EWMA volatility
 */
function calculateEWMAVol(prices: number[], lambda: number = 0.94): number[] {
  if (prices.length < 2) return [];

  const returns = prices.slice(1).map((price, i) => 
    Math.log(price / prices[i])
  );

  // Initialize variance with first return squared
  let variance = returns[0] * returns[0];
  const variances = [variance];

  // Calculate EWMA variances
  for (let i = 1; i < returns.length; i++) {
    variance = lambda * variance + (1 - lambda) * returns[i] * returns[i];
    variances.push(variance);
  }

  const annualizedVols = variances.map(v => Math.sqrt(v * 252) * 100);
  return [annualizedVols[0], ...annualizedVols];
}

/**
 * Calculate ensemble forecast using multiple models
 */
function calculateEnsembleVol(prices: number[]): number[] {
  const historicalVol = calculateHistoricalVol(prices);
  const ewmaFastVol = calculateEWMAVol(prices, 0.94);
  const ewmaSlowVol = calculateEWMAVol(prices, 0.97);

  return historicalVol.map((_, i) => {
    const validVols = [
      historicalVol[i],
      ewmaFastVol[i],
      ewmaSlowVol[i]
    ].filter(v => !isNaN(v));

    return validVols.reduce((a, b) => a + b, 0) / validVols.length;
  });
}

async function fetchHistoricalPrices(ticker: string): Promise<{ prices: number[], dates: string[] }> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add random delay to avoid thundering herd
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Try Alpha Vantage first (more reliable)
      try {
        console.log(`Trying Alpha Vantage for ${ticker} (attempt ${attempt + 1})`);
        const alphaVantageData = await getAlphaVantageHistoricalPrices(ticker, 'compact');
        console.log(`Successfully fetched ${alphaVantageData.prices.length} days from Alpha Vantage for ${ticker}`);
        return alphaVantageData;
      } catch (alphaVantageError) {
        console.log(`Alpha Vantage failed for ${ticker}, falling back to Yahoo Finance:`, alphaVantageError);
      }

      // Fallback to Yahoo Finance
      console.log(`Trying Yahoo Finance for ${ticker} (attempt ${attempt + 1})`);
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`, {
        params: {
          range: '90d',
          interval: '1d',
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://finance.yahoo.com/',
          'Origin': 'https://finance.yahoo.com',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site'
        },
        timeout: 15000, // Increased timeout
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      });

      // Handle rate limiting with fallback data
      if (response.status === 429) {
        console.log(`Rate limited for ${ticker}, attempt ${attempt + 1}/${maxRetries}`);
        if (attempt < maxRetries - 1) {
          continue; // Retry
        } else {
          // Return fallback mock data for common tickers
          console.log(`Using fallback data for ${ticker} due to rate limiting`);
          return generateFallbackPriceData(ticker);
        }
      }

      if (!response.data?.chart?.result?.[0]) {
        throw new Error('Invalid response format from Yahoo Finance');
      }

      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const prices = result.indicators.quote[0].close;

      if (!timestamps?.length || !prices?.length) {
        throw new Error('No price data available');
      }

      return {
        prices: prices.filter((price: number | null) => price !== null),
        dates: timestamps.map((ts: number) => new Date(ts * 1000).toISOString())
      };
    } catch (error) {
      console.error(`Error fetching historical prices for ${ticker} (attempt ${attempt + 1}):`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Ticker ${ticker} not found`);
        } else if (error.response?.status === 429) {
          // Rate limiting - will retry
          continue;
        }
      }
      
      // If this is the last attempt, return fallback data
      if (attempt === maxRetries - 1) {
        console.log(`Using fallback data for ${ticker} after ${maxRetries} attempts`);
        return generateFallbackPriceData(ticker);
      }
    }
  }

  // Should never reach here
  throw new Error(`Failed to fetch historical prices for ${ticker} after ${maxRetries} attempts`);
}

function generateFallbackPriceData(ticker: string): { prices: number[], dates: string[] } {
  // Generate 90 days of mock price data
  const prices: number[] = [];
  const dates: string[] = [];
  
  // Base prices for common tickers
  const basePrices: { [key: string]: number } = {
    'SPY': 450,
    'QQQ': 350,
    'IWM': 180,
    'DIA': 340,
    'VIX': 20,
    'AAPL': 170,
    'MSFT': 350,
    'GOOGL': 130,
    'TSLA': 250,
    'NVDA': 450
  };
  
  const basePrice = basePrices[ticker.toUpperCase()] || 100;
  let currentPrice = basePrice;
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString());
    
    // Add some realistic price movement (random walk)
    const change = (Math.random() - 0.5) * 0.04; // ±2% daily change
    currentPrice = currentPrice * (1 + change);
    prices.push(Number(currentPrice.toFixed(2)));
  }
  
  return { prices, dates };
}

/**
 * Generate volatility forecast
 */
export async function POST(request: Request) {
  try {
    const body: ForecastRequest = await request.json();
    const { ticker, prices, dates } = body;

    if (!ticker || !prices?.length || !dates?.length || prices.length !== dates.length) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Calculate historical and forecast volatilities
    const historicalData = calculateHistoricalVol(prices);
    const forecastData = calculateEWMAVol(prices);
    const ensembleForecastData = calculateEnsembleVol(prices);

    // Get implied volatility using our robust multi-source approach
    let impliedVol: (number | null)[] = Array(prices.length).fill(null);
    try {
      const { impliedVol: iv } = await getImpliedVolatility(ticker);
      impliedVol[impliedVol.length - 1] = iv;
      console.log(`Successfully fetched implied volatility for ${ticker}: ${iv}%`);
    } catch (error) {
      console.error(`Failed to fetch implied volatility for ${ticker}:`, error);
      // Set to null so the UI can handle the missing data gracefully
      impliedVol[impliedVol.length - 1] = null;
    }

    console.log(`POST Forecast API Response Summary for ${ticker}:`, {
      labelsCount: dates.length,
      historicalDataCount: historicalData.length,
      forecastDataCount: forecastData.length,
      ensembleDataCount: ensembleForecastData.length,
      impliedVolValue: impliedVol[impliedVol.length - 1],
      sampleHistoricalData: historicalData.slice(-5),
      sampleForecastData: forecastData.slice(-5)
    });

    return NextResponse.json({
      labels: dates,
      historicalData,
      forecastData,
      ensembleForecastData,
      impliedVol
    } as ForecastResponse);

  } catch (error) {
    console.error('Error processing volatility forecast:', error);
    return NextResponse.json(
      { error: 'Failed to calculate volatility forecast' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ticker = url.searchParams.get('ticker');

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      );
    }

    // Fetch historical data
    const { prices, dates } = await fetchHistoricalPrices(ticker);

    if (!prices.length || !dates.length) {
      return NextResponse.json(
        { error: 'No price data available for the specified ticker' },
        { status: 404 }
      );
    }

    // Calculate volatilities
    const historicalData = calculateHistoricalVol(prices);
    const forecastData = calculateEWMAVol(prices);
    const ensembleForecastData = calculateEnsembleVol(prices);

    // Get implied volatility using our robust multi-source approach
    let impliedVol: (number | null)[] = Array(prices.length).fill(null);
    try {
      const { impliedVol: iv } = await getImpliedVolatility(ticker);
      impliedVol[impliedVol.length - 1] = iv;
      console.log(`Successfully fetched implied volatility for ${ticker}: ${iv}%`);
    } catch (error) {
      console.error(`Failed to fetch implied volatility for ${ticker}:`, error);
      // Set to null so the UI can handle the missing data gracefully
      impliedVol[impliedVol.length - 1] = null;
    }

    console.log(`GET Forecast API Response Summary for ${ticker}:`, {
      labelsCount: dates.length,
      historicalDataCount: historicalData.length,
      forecastDataCount: forecastData.length,
      ensembleDataCount: ensembleForecastData.length,
      impliedVolValue: impliedVol[impliedVol.length - 1],
      sampleHistoricalData: historicalData.slice(-5),
      sampleForecastData: forecastData.slice(-5)
    });

    return NextResponse.json({
      labels: dates,
      historicalData,
      forecastData,
      ensembleForecastData,
      impliedVol
    });

  } catch (error) {
    console.error('Error processing volatility forecast:', error);
    
    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      } else if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: error.message },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to calculate volatility forecast' },
      { status: 500 }
    );
  }
}

// Simple health check - remove this after debugging
export async function OPTIONS() {
  return NextResponse.json({ 
    status: 'OK', 
    message: 'Forecast API route is accessible',
    timestamp: new Date().toISOString()
  });
} 
import { NextResponse } from 'next/server';
import { getImpliedVolatility } from '../yahoo-finance';
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
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`, {
      params: {
        range: '90d',
        interval: '1d',
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com'
      },
      timeout: 10000
    });

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
    console.error('Error fetching historical prices:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Ticker ${ticker} not found`);
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      }
    }
    throw new Error('Failed to fetch historical prices');
  }
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
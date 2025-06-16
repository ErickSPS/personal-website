import axios from 'axios';

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHAVANTAGE_API_KEY;

if (!API_KEY) {
  console.warn('ALPHAVANTAGE_API_KEY not found in environment variables');
}

interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

/**
 * Get historical daily prices from Alpha Vantage
 * Simple, focused implementation for price data only
 */
export async function getHistoricalPrices(
  symbol: string,
  outputSize: 'compact' | 'full' = 'compact'
): Promise<{
  prices: number[];
  dates: string[];
}> {
  if (!API_KEY) {
    throw new Error('Alpha Vantage API key not configured');
  }

  try {
    console.log(`Fetching historical prices from Alpha Vantage for ${symbol}`);
    
    const response = await axios.get<AlphaVantageTimeSeriesResponse>(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        outputsize: outputSize,
        apikey: API_KEY,
      },
      timeout: 15000,
    });

    // Check for Alpha Vantage error messages
    if (typeof response.data === 'object' && response.data) {
      const data = response.data as any;
      if (data['Error Message']) {
        throw new Error(`Alpha Vantage Error: ${data['Error Message']}`);
      }
      if (data['Note'] && data['Note'].includes('call frequency')) {
        throw new Error(`Alpha Vantage Rate Limit: ${data['Note']}`);
      }
    }

    const timeSeries = response.data['Time Series (Daily)'];
    
    if (!timeSeries) {
      throw new Error('No time series data in Alpha Vantage response');
    }

    // Convert to arrays and sort by date (most recent first)
    const dates = Object.keys(timeSeries).sort();
    const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

    // Take last 90 days for consistency
    const last90Days = Math.min(90, dates.length);
    const recentDates = dates.slice(-last90Days);
    const recentPrices = prices.slice(-last90Days);

    console.log(`Successfully fetched ${recentPrices.length} days of historical data from Alpha Vantage for ${symbol}`);

    return { 
      prices: recentPrices, 
      dates: recentDates 
    };
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    throw error;
  }
} 
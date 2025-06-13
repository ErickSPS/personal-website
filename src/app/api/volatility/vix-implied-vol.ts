import axios from 'axios';

// Common headers for Yahoo Finance API
const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com'
};

// VIX and related volatility indices mapping
const VOLATILITY_INDICES = {
  // Major ETFs - direct volatility index mapping
  'SPY': '^VIX',     // S&P 500 VIX
  'SPX': '^VIX',     // S&P 500 VIX
  'QQQ': '^VXN',     // NASDAQ-100 VIX
  'NDX': '^VXN',     // NASDAQ-100 VIX
  'IWM': '^RVX',     // Russell 2000 VIX
  'RUT': '^RVX',     // Russell 2000 VIX
  'DIA': '^VXD',     // Dow Jones VIX
  'EFA': '^VIX',     // International developed markets (use VIX as proxy)
  'EEM': '^VIX',     // Emerging markets (use VIX as proxy)
  
  // Sector ETFs - use VIX as base
  'XLF': '^VIX',     // Financial sector
  'XLK': '^VXN',     // Technology sector (use NASDAQ VIX)
  'XLE': '^VIX',     // Energy sector
  'XLV': '^VIX',     // Healthcare sector
  'XLI': '^VIX',     // Industrial sector
  'XLP': '^VIX',     // Consumer staples
  'XLY': '^VIX',     // Consumer discretionary
  'XLU': '^VIX',     // Utilities
  'XLB': '^VIX',     // Materials
  'XLRE': '^VIX',    // Real estate
} as const;

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface VIXData {
  symbol: string;
  price: number;
  timestamp: number;
}

interface BetaData {
  beta: number;
  correlation: number;
  timestamp: number;
}

/**
 * Fetch VIX or related volatility index data
 */
async function fetchVolatilityIndex(indexSymbol: string): Promise<VIXData> {
  const cacheKey = `vix_${indexSymbol}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${indexSymbol}`, {
      headers: YAHOO_HEADERS,
      timeout: 10000,
    });

    if (!response.data?.chart?.result?.[0]) {
      throw new Error('Invalid response format from Yahoo Finance');
    }

    const result = response.data.chart.result[0];
    const meta = result.meta;
    
    if (!meta?.regularMarketPrice && !meta?.previousClose) {
      throw new Error('No price data available');
    }

    const price = meta.regularMarketPrice || meta.previousClose;
    const timestamp = meta.regularMarketTime || Date.now() / 1000;

    const data = {
      symbol: indexSymbol,
      price: price,
      timestamp: timestamp * 1000, // Convert to milliseconds
    };

    // Cache the result
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${indexSymbol} data:`, error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Volatility index ${indexSymbol} not found`);
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      }
    }
    throw new Error(`Failed to fetch ${indexSymbol} data`);
  }
}

/**
 * Calculate beta of a stock relative to SPY using historical price correlation
 */
async function calculateBeta(symbol: string, benchmarkSymbol: string = 'SPY', days: number = 252): Promise<BetaData> {
  const cacheKey = `beta_${symbol}_${benchmarkSymbol}_${days}`;
  const cachedData = cache.get(cacheKey);
  
  // Cache beta for 1 hour since it doesn't change frequently
  if (cachedData && Date.now() - cachedData.timestamp < 60 * 60 * 1000) {
    return cachedData.data;
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days - 10); // Extra days for calculations

    const promises = [
      axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
        params: {
          period1: Math.floor(startDate.getTime() / 1000),
          period2: Math.floor(endDate.getTime() / 1000),
          interval: '1d',
        },
        headers: YAHOO_HEADERS,
        timeout: 10000,
      }),
      axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${benchmarkSymbol}`, {
        params: {
          period1: Math.floor(startDate.getTime() / 1000),
          period2: Math.floor(endDate.getTime() / 1000),
          interval: '1d',
        },
        headers: YAHOO_HEADERS,
        timeout: 10000,
      }),
    ];

    const [stockResponse, benchmarkResponse] = await Promise.all(promises);
    
    if (!stockResponse.data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ||
        !benchmarkResponse.data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
      throw new Error('Invalid response format from Yahoo Finance');
    }

    const stockPrices = stockResponse.data.chart.result[0].indicators.quote[0].close;
    const benchmarkPrices = benchmarkResponse.data.chart.result[0].indicators.quote[0].close;

    if (!stockPrices.length || !benchmarkPrices.length) {
      throw new Error('No price data available');
    }

    // Calculate daily returns
    const stockReturns = calculateReturns(stockPrices);
    const benchmarkReturns = calculateReturns(benchmarkPrices);

    if (!stockReturns.length || !benchmarkReturns.length) {
      throw new Error('Insufficient data for beta calculation');
    }

    // Calculate beta and correlation
    const beta = calculateCovariance(stockReturns, benchmarkReturns) / calculateVariance(benchmarkReturns);
    const correlation = calculateCorrelation(stockReturns, benchmarkReturns);

    const data = {
      beta: Math.max(0.1, Math.min(3.0, beta)), // Clamp beta between 0.1 and 3.0
      correlation: Math.max(0.1, Math.abs(correlation)), // Use absolute correlation, min 0.1
      timestamp: Date.now(),
    };

    // Cache for 1 hour
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`Error calculating beta for ${symbol}:`, error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Ticker ${symbol} or ${benchmarkSymbol} not found`);
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      }
    }
    // Return default values if calculation fails
    return {
      beta: 1.0,
      correlation: 0.7,
      timestamp: Date.now(),
    };
  }
}

/**
 * Calculate daily returns from price series
 */
function calculateReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] && prices[i-1] && prices[i-1] !== 0) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
  }
  return returns;
}

/**
 * Calculate covariance between two return series
 */
function calculateCovariance(x: number[], y: number[]): number {
  const minLength = Math.min(x.length, y.length);
  const xMean = x.slice(0, minLength).reduce((a, b) => a + b, 0) / minLength;
  const yMean = y.slice(0, minLength).reduce((a, b) => a + b, 0) / minLength;
  
  let covariance = 0;
  for (let i = 0; i < minLength; i++) {
    covariance += (x[i] - xMean) * (y[i] - yMean);
  }
  
  return covariance / (minLength - 1);
}

/**
 * Calculate variance of a return series
 */
function calculateVariance(x: number[]): number {
  const mean = x.reduce((a, b) => a + b, 0) / x.length;
  const variance = x.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (x.length - 1);
  return variance;
}

/**
 * Calculate correlation between two return series
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const minLength = Math.min(x.length, y.length);
  const covariance = calculateCovariance(x, y);
  const xStd = Math.sqrt(calculateVariance(x.slice(0, minLength)));
  const yStd = Math.sqrt(calculateVariance(y.slice(0, minLength)));
  
  return covariance / (xStd * yStd);
}

/**
 * Get VIX-based implied volatility for any symbol
 */
export async function getVIXBasedImpliedVolatility(symbol: string): Promise<{
  impliedVol: number;
  source: string;
  timestamp: number;
  metadata?: {
    beta?: number;
    correlation?: number;
    baseVIX?: number;
  };
}> {
  try {
    const upperSymbol = symbol.toUpperCase();
    
    // Check if we have a direct volatility index mapping
    if (upperSymbol in VOLATILITY_INDICES) {
      const indexSymbol = VOLATILITY_INDICES[upperSymbol as keyof typeof VOLATILITY_INDICES];
      const vixData = await fetchVolatilityIndex(indexSymbol);
      
      return {
        impliedVol: vixData.price,
        source: `Direct mapping to ${indexSymbol}`,
        timestamp: vixData.timestamp,
        metadata: {
          baseVIX: vixData.price,
        },
      };
    }
    
    // For individual stocks, calculate beta-adjusted implied volatility
    const [vixData, betaData] = await Promise.all([
      fetchVolatilityIndex('^VIX'),
      calculateBeta(upperSymbol),
    ]);
    
    // Formula: Stock IV = VIX × Beta × Correlation Adjustment
    // Add a small premium for individual stock risk
    const stockPremium = 1.1; // 10% premium for single stock vs market
    const impliedVol = vixData.price * betaData.beta * betaData.correlation * stockPremium;
    
    // Ensure reasonable bounds (5% to 100%)
    const boundedImpliedVol = Math.max(5, Math.min(100, impliedVol));
    
    return {
      impliedVol: boundedImpliedVol,
      source: `VIX-based calculation for individual stock`,
      timestamp: Math.min(vixData.timestamp, betaData.timestamp),
      metadata: {
        beta: betaData.beta,
        correlation: betaData.correlation,
        baseVIX: vixData.price,
      },
    };
  } catch (error) {
    console.error(`Error calculating VIX-based implied volatility for ${symbol}:`, error);
    throw new Error(`Failed to calculate VIX-based implied volatility for ${symbol}`);
  }
}

/**
 * Get current VIX value (for reference)
 */
export async function getCurrentVIX(): Promise<VIXData> {
  return fetchVolatilityIndex('^VIX');
} 
import axios from 'axios';
import { Option, OptionChain } from '@/types/options';
import { calculateATMImpliedVol } from '@/app/utils/options-math';
import { getVIXBasedImpliedVolatility } from './vix-implied-vol';

const YAHOO_FINANCE_API = 'https://query2.finance.yahoo.com/v7/finance/options';

// Rotate between different user agents to avoid detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
];

// Common headers for Yahoo Finance API
function getYahooHeaders() {
  const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  return {
    'User-Agent': randomUserAgent,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://finance.yahoo.com/',
    'Origin': 'https://finance.yahoo.com',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site'
  };
}

interface YahooOptionResponse {
  optionChain: {
    result: Array<{
      quote: {
        regularMarketPrice: number;
        regularMarketTime: number;
      };
      options: Array<{
        expirationDate: number;
        strikes: number[];
        calls: YahooOption[];
        puts: YahooOption[];
      }>;
    }>;
  };
}

interface YahooOption {
  strike: number;
  lastPrice: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  expiration: number;
  lastTradeDate: number;
  impliedVolatility: number;
  inTheMoney: boolean;
}

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 60 seconds

/**
 * Get option chain data from Yahoo Finance
 */
export async function getOptionChain(symbol: string): Promise<{
  optionChain: OptionChain;
  spotPrice: number;
  timestamp: number;
}> {
  // Check cache first
  const cacheKey = `optionChain_${symbol}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const response = await axios.get<YahooOptionResponse>(`${YAHOO_FINANCE_API}/${symbol}`, {
      headers: getYahooHeaders(),
      timeout: 15000, // Increased timeout
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    });

    // Handle 401/403 responses gracefully
    if (response.status === 401 || response.status === 403) {
      throw new Error('Yahoo Finance API access denied - using fallback method');
    }

    if (!response.data?.optionChain?.result?.[0]) {
      throw new Error('Invalid response format from Yahoo Finance');
    }

    const result = response.data.optionChain.result[0];
    
    if (!result.quote?.regularMarketPrice || !result.options?.[0]) {
      throw new Error('No option data available');
    }

    const spotPrice = result.quote.regularMarketPrice;
    const timestamp = result.quote.regularMarketTime;

    // Transform the first expiration's options
    const firstExpSet = result.options[0];
    const optionChain: OptionChain = {
      calls: transformOptions(firstExpSet.calls, 'call'),
      puts: transformOptions(firstExpSet.puts, 'put'),
      expirationDates: result.options.map(opt => new Date(opt.expirationDate * 1000).toISOString()),
      strikes: firstExpSet.strikes,
    };

    const data = { optionChain, spotPrice, timestamp };
    
    // Update cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('Error fetching option chain:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Ticker ${symbol} not found`);
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Yahoo Finance API access denied - using fallback method');
      }
    }
    throw new Error('Failed to fetch option chain data');
  }
}

/**
 * Transform Yahoo Finance option format to our format
 */
function transformOptions(options: YahooOption[], type: 'call' | 'put'): Option[] {
  return options.map(opt => ({
    strike: opt.strike,
    expiration: new Date(opt.expiration * 1000).toISOString(),
    type,
    bid: opt.bid,
    ask: opt.ask,
    volume: opt.volume,
    openInterest: opt.openInterest,
    lastPrice: opt.lastPrice,
    change: 0, // Not provided by Yahoo
    percentChange: 0, // Not provided by Yahoo
    inTheMoney: opt.inTheMoney,
  }));
}

/**
 * Calculate implied volatility for a symbol using multiple approaches
 */
export async function getImpliedVolatility(symbol: string): Promise<{
  impliedVol: number;
  spotPrice?: number;
  timestamp: number;
  source?: string;
  metadata?: any;
}> {
  console.log(`Attempting to get implied volatility for ${symbol}`);
  
  try {
    // First, try to get options-based implied volatility
    try {
      const { optionChain, spotPrice, timestamp } = await getOptionChain(symbol);
      
      // Combine calls and puts for ATM calculation
      const allOptions = [...optionChain.calls, ...optionChain.puts];
      
      // Calculate ATM implied volatility using Bjerksund-Stensland
      const impliedVol = calculateATMImpliedVol(allOptions, spotPrice);
      
      console.log(`Successfully calculated options-based IV for ${symbol}: ${impliedVol * 100}%`);
      
      return {
        impliedVol: impliedVol * 100, // Convert to percentage
        spotPrice,
        timestamp,
        source: 'Options chain calculation',
      };
    } catch (optionsError) {
      console.log(`Options-based IV failed for ${symbol}, falling back to VIX-based approach:`, optionsError);
      
      // Fallback to VIX-based calculation
      const vixResult = await getVIXBasedImpliedVolatility(symbol);
      
      console.log(`Successfully fetched VIX-based IV for ${symbol}: ${vixResult.impliedVol}%`);
      
      return {
        impliedVol: vixResult.impliedVol,
        timestamp: vixResult.timestamp,
        source: vixResult.source,
        metadata: vixResult.metadata,
      };
    }
  } catch (error) {
    console.error('Error calculating implied volatility:', error);
    throw new Error('Failed to calculate implied volatility using all available methods');
  }
}

/**
 * Get VIX-based implied volatility (direct access to the new method)
 */
export async function getVIXImpliedVolatility(symbol: string): Promise<{
  impliedVol: number;
  timestamp: number;
  source: string;
  metadata?: any;
}> {
  return getVIXBasedImpliedVolatility(symbol);
} 
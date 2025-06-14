import axios from 'axios';
import { MarketEvent } from '@/types/market-events';

export interface VolatilityResponse {
  dates: string[];
  historical: number[];
  ewma_fast: number[];
  ensemble: number[];
  implied_vol: (number | null)[];
}

export interface MarketData {
  prices: number[];
  timestamps: number[];
}

export interface VolatilityResult {
  historicalData: number[];
  forecastData: (number | null)[];
  ensembleForecastData: (number | null)[];
  labels: string[];
  historicalVol: number | null;
  modelPredictions?: ModelPredictions;
}

export interface VolatilityConfig {
  historicalWindow: number;  // Number of historical days to show
  forecastWindow: number;    // Number of days to forecast
}

const DEFAULT_CONFIG: VolatilityConfig = {
  historicalWindow: 90,
  forecastWindow: 30
};

export interface ModelPredictions {
  historical: number | null;
  ewma: number | null;
  ensemble: number | null;
  implied?: number | null;
}

export async function fetchVolatilityData(ticker: string): Promise<VolatilityResponse> {
  try {
    console.log(`[VolatilityService] Fetching data for ticker: ${ticker}`);
    
    // Use our API route instead of direct Yahoo Finance call
    const response = await axios.get(`/api/volatility/forecast?ticker=${ticker}`, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`[VolatilityService] API Response status: ${response.status}`);
    console.log(`[VolatilityService] API Response data keys:`, Object.keys(response.data));
    
    // Transform the API response to match the expected interface
    const apiData = response.data;
    
    // API returns: {labels, historicalData, forecastData, ensembleForecastData, impliedVol}
    // Service expects: {dates, historical, ewma_fast, ensemble, implied_vol}
    
    const transformedData = {
      dates: apiData.labels || [],
      historical: apiData.historicalData || [],
      ewma_fast: apiData.forecastData || [],
      ensemble: apiData.ensembleForecastData || [],
      implied_vol: Array.isArray(apiData.impliedVol) ? apiData.impliedVol : []
    };
    
    console.log(`[VolatilityService] Transformed data:`, {
      datesLength: transformedData.dates.length,
      historicalLength: transformedData.historical.length,
      ewmaLength: transformedData.ewma_fast.length,
      ensembleLength: transformedData.ensemble.length,
      impliedVolLength: transformedData.implied_vol.length,
      sampleDates: transformedData.dates.slice(0, 3),
      sampleHistorical: transformedData.historical.slice(-3)
    });
    
    return transformedData;
  } catch (error) {
    console.error('[VolatilityService] Error fetching volatility data:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('[VolatilityService] Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    throw new Error(`Failed to fetch volatility data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function processVolatilityData(data: VolatilityResponse): VolatilityResult {
  console.log('[VolatilityService] Processing volatility data:', {
    hasData: !!data,
    hasDates: !!data?.dates,
    hasHistorical: !!data?.historical,
    hasEwmaFast: !!data?.ewma_fast,
    hasEnsemble: !!data?.ensemble,
    datesLength: data?.dates?.length,
    historicalLength: data?.historical?.length
  });

  if (!data || !data.dates || !data.historical || !data.ewma_fast || !data.ensemble) {
    console.error('[VolatilityService] Invalid or missing data in volatility response:', data);
    throw new Error('Invalid or missing data in volatility response');
  }

  // Ensure all arrays are the same length
  const maxLength = Math.min(
    data.dates.length,
    data.historical.length,
    data.ewma_fast.length,
    data.ensemble.length,
    data.implied_vol.length || data.dates.length
  );

  console.log('[VolatilityService] Array lengths:', {
    dates: data.dates.length,
    historical: data.historical.length,
    ewma_fast: data.ewma_fast.length,
    ensemble: data.ensemble.length,
    implied_vol: data.implied_vol.length,
    maxLength
  });

  // Get valid data points and handle nulls properly
  const validData = Array.from({ length: maxLength }, (_, i) => ({
    date: data.dates[i],
    historical: data.historical[i],
    ewma: data.ewma_fast[i],
    ensemble: data.ensemble[i],
    implied: data.implied_vol[i] || null
  })).filter(d => 
    d.date && 
    (typeof d.historical === 'number' || d.historical === null) &&
    (typeof d.ewma === 'number' || d.ewma === null) &&
    (typeof d.ensemble === 'number' || d.ensemble === null)
  );

  // Find the last valid data point with actual numbers (not null)
  const lastValidIndex = validData.length - 1;
  const lastValid = lastValidIndex >= 0 ? validData[lastValidIndex] : null;
  
  // Find the last valid historical volatility (not null/NaN)
  const lastValidHistorical = validData
    .map(d => d.historical)
    .filter(h => typeof h === 'number' && !isNaN(h))
    .pop() || null;

  console.log('[VolatilityService] Processing results:', {
    inputLength: data.dates.length,
    validLength: validData.length,
    lastValidIndex,
    lastValidHistorical,
    lastValid: lastValid ? {
      date: lastValid.date,
      historical: lastValid.historical,
      ewma: lastValid.ewma,
      ensemble: lastValid.ensemble,
      implied: lastValid.implied
    } : null
  });

  return {
    historicalData: validData.map(d => d.historical),
    forecastData: validData.map(d => d.ewma),
    ensembleForecastData: validData.map(d => d.ensemble),
    labels: validData.map(d => d.date),
    historicalVol: lastValidHistorical,
    modelPredictions: lastValid ? {
      historical: lastValid.historical,
      ewma: lastValid.ewma,
      ensemble: lastValid.ensemble,
      implied: lastValid.implied
    } : {
      historical: lastValidHistorical,
      ewma: null,
      ensemble: null,
      implied: null
    }
  };
}

async function fetchFREDEvents(): Promise<MarketEvent[]> {
  try {
    // FRED Economic Calendar (free, requires API key)
    const response = await axios.get('https://api.stlouisfed.org/fred/releases/dates', {
      params: {
        api_key: process.env.FRED_API_KEY,
        file_type: 'json',
        limit: 50,
        realtime_start: new Date().toISOString().split('T')[0]
      }
    });

    return response.data.release_dates?.map((release: any) => ({
      type: 'economic' as const,
      date: new Date(release.date),
      title: release.release_name || 'Economic Release',
      description: `FRED Economic Data Release: ${release.release_name}`,
      historicalAvgMove: 0.5,
      expectedVolImpact: 0.8
    })) || [];
  } catch (error) {
    console.error('Error fetching FRED events:', error);
    return [];
  }
}

async function getDemoEarningsEvents(ticker: string): Promise<MarketEvent[]> {
  // Popular stocks with predictable earnings cycles for demo purposes
  const demoEarnings: Record<string, string[]> = {
    'AAPL': ['2025-01-30', '2025-04-30', '2025-07-30', '2025-10-30'],
    'MSFT': ['2025-01-24', '2025-04-25', '2025-07-25', '2025-10-24'],
    'GOOGL': ['2025-02-04', '2025-04-29', '2025-07-29', '2025-10-28'],
    'AMZN': ['2025-02-01', '2025-04-26', '2025-07-26', '2025-10-25'],
    'TSLA': ['2025-01-29', '2025-04-23', '2025-07-23', '2025-10-23'],
    'NVDA': ['2025-02-19', '2025-05-21', '2025-08-20', '2025-11-19'],
    'META': ['2025-01-29', '2025-04-24', '2025-07-31', '2025-10-30'],
    'NFLX': ['2025-01-21', '2025-04-17', '2025-07-17', '2025-10-16']
  };

  const dates = demoEarnings[ticker.toUpperCase()] || [];
  
  if (dates.length === 0) {
    // Generic quarterly dates for unknown tickers
    const today = new Date();
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const nextQuarterMonths = [1, 4, 7, 10]; // Feb, May, Aug, Nov
    
    return nextQuarterMonths
      .map(month => {
        const year = month <= today.getMonth() ? today.getFullYear() + 1 : today.getFullYear();
        return new Date(year, month, 15); // 15th of earnings month
      })
      .filter(date => date > today)
      .slice(0, 2)
      .map(date => ({
        type: 'earnings' as const,
        date,
        title: `${ticker.toUpperCase()} Earnings`,
        description: 'Quarterly Earnings Report (Estimated)',
        historicalAvgMove: 3.0,
        expectedVolImpact: 2.5
      }));
  }

  return dates
    .map(date => new Date(date))
    .filter(date => date > new Date())
    .map((date, index) => ({
      type: 'earnings' as const,
      date,
      title: `${ticker.toUpperCase()} Earnings`,
      description: `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()} Earnings Report`,
      historicalAvgMove: 3.5,
      expectedVolImpact: 2.8
    }));
}

// Secure AlphaVantage via server-side proxy (API key stays on server)
async function fetchAlphaVantageEvents(): Promise<MarketEvent[]> {
  try {
    // Call our secure API proxy instead of AlphaVantage directly
    const response = await axios.get('/api/market-events?source=news', {
      timeout: 8000
    });
    
    if (!response.data.events || response.data.events.length === 0) {
      console.log('📈 No AlphaVantage events available');
      return [];
    }
    
    console.log(`📈 Found ${response.data.events.length} AlphaVantage events (${response.data.source})`);
    
    // Filter for future events and format properly
    return response.data.events
      .filter((event: any) => new Date(event.date) > new Date())
      .map((event: any) => ({
        type: 'economic' as const,
        date: new Date(event.date),
        title: event.title,
        description: event.description,
        historicalAvgMove: event.historicalAvgMove,
        expectedVolImpact: event.expectedVolImpact
      }))
      .slice(0, 4); // Limit for better UX
      
  } catch (error) {
    console.log('📈 AlphaVantage proxy unavailable:', (error as Error).message);
    return [];
  }
}

async function fetchFinancialModelingPrepEvents(ticker: string): Promise<MarketEvent[]> {
  try {
    if (!process.env.FMP_API_KEY) return [];
    
    const fromDate = new Date().toISOString().split('T')[0];
    const toDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await axios.get('https://financialmodelingprep.com/api/v3/earning_calendar', {
      params: {
        from: fromDate,
        to: toDate,
        apikey: process.env.FMP_API_KEY
      }
    });

    return response.data?.filter((earning: any) => 
      earning.symbol === ticker.toUpperCase()
    ).map((earning: any) => ({
      type: 'earnings' as const,
      date: new Date(earning.date),
      title: `${earning.symbol} Earnings`,
      description: `Q${earning.fiscalDateEnding?.split('-')[1]} ${new Date(earning.fiscalDateEnding).getFullYear()} Earnings Report`,
      historicalAvgMove: 4.2,
      expectedVolImpact: 3.5
    })) || [];
  } catch (error) {
    console.error('Error fetching FMP events:', error);
    return [];
  }
}

async function fetchIEXCloudEvents(ticker: string): Promise<MarketEvent[]> {
  try {
    if (!process.env.IEX_API_KEY) return [];
    
    const response = await axios.get(`https://cloud.iexapis.com/stable/stock/${ticker}/upcoming-earnings`, {
      params: {
        token: process.env.IEX_API_KEY
      }
    });

    return response.data?.map((earning: any) => ({
      type: 'earnings' as const,
      date: new Date(earning.reportDate),
      title: `${ticker.toUpperCase()} Earnings`,
      description: `${earning.fiscalQuarter} ${earning.fiscalYear} Earnings Report`,
      historicalAvgMove: 3.8,
      expectedVolImpact: 3.2
    })) || [];
  } catch (error) {
    console.error('Error fetching IEX Cloud events:', error);
    return [];
  }
}

// Improved FOMC fetching with fallback
async function fetchFOMCDates(): Promise<MarketEvent[]> {
  try {
    // Primary source - Federal Reserve official JSON
    const response = await axios.get('https://www.federalreserve.gov/json/fomc.json', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VolatilityBot/1.0)',
        'Accept': 'application/json'
      }
    });
    
    const currentYear = new Date().getFullYear();
    const meetings = response.data.meetings || [];
    
    return meetings
      .filter((meeting: any) => new Date(meeting.date) > new Date())
      .map((meeting: any) => ({
        type: 'fomc' as const,
        date: new Date(meeting.date),
        title: 'FOMC Meeting',
        description: 'Federal Open Market Committee Meeting and Policy Decision',
        historicalAvgMove: 1.5,
        expectedVolImpact: 2.0
      }));
  } catch (error) {
    console.error('Error fetching FOMC dates:', error);
    
    // Fallback to hardcoded 2024/2025 FOMC dates
    const fallbackDates = [
      '2025-01-29', '2025-03-19', '2025-04-30', '2025-06-11',
      '2025-07-30', '2025-09-17', '2025-10-29', '2025-12-17'
    ];
    
    return fallbackDates
      .map(date => new Date(date))
      .filter(date => date > new Date())
      .map(date => ({
        type: 'fomc' as const,
        date,
        title: 'FOMC Meeting',
        description: 'Federal Open Market Committee Meeting and Policy Decision',
        historicalAvgMove: 1.5,
        expectedVolImpact: 2.0
      }));
  }
}

// Improved earnings fetching with multiple sources
async function fetchEarningsEvents(ticker: string): Promise<MarketEvent[]> {
  const sources = [
    () => fetchFinancialModelingPrepEvents(ticker),
    () => fetchIEXCloudEvents(ticker),
    () => fetchYahooEarnings(ticker)  // Keep as fallback
  ];
  
  for (const source of sources) {
    try {
      const events = await source();
      if (events.length > 0) return events;
    } catch (error) {
      console.warn('Earnings source failed, trying next...', error);
    }
  }
  
  return [];
}

// Improved Yahoo earnings with better headers
async function fetchYahooEarnings(ticker: string): Promise<MarketEvent[]> {
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}`, {
      params: {
        modules: 'calendarEvents'
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
    
    const earnings = response.data?.quoteSummary?.result?.[0]?.calendarEvents?.earnings;
    
    if (!earnings?.earningsDate?.[0]) return [];

    return earnings.earningsDate.map((date: any) => ({
      type: 'earnings' as const,
      date: new Date(date * 1000),
      title: `${ticker.toUpperCase()} Earnings`,
      description: 'Quarterly Earnings Report',
      historicalAvgMove: 3.5,
      expectedVolImpact: 2.8
    }));
  } catch (error) {
    console.error('Error fetching Yahoo earnings dates:', error);
    return [];
  }
}

// Updated for personal branding - reliable demo data
export async function fetchMarketEvents(ticker: string): Promise<MarketEvent[]> {
  try {
    console.log(`🔍 Fetching market events for ${ticker}...`);
    
    // Always get FOMC dates (most reliable)
    const fomcEvents = await fetchFOMCDates();
    console.log(`📅 Found ${fomcEvents.length} FOMC events`);
    
    // Try earnings sources with demo fallback
    let earningsEvents: MarketEvent[] = [];
    try {
      earningsEvents = await fetchEarningsEvents(ticker);
      if (earningsEvents.length === 0) {
        console.log('📊 No live earnings data, using demo data');
        earningsEvents = await getDemoEarningsEvents(ticker);
      }
    } catch (error) {
      console.log('📊 Earnings sources failed, using demo data');
      earningsEvents = await getDemoEarningsEvents(ticker);
    }
    console.log(`💼 Found ${earningsEvents.length} earnings events`);

    // Try Alpha Vantage via secure proxy
    let economicEvents: MarketEvent[] = [];
    try {
      economicEvents = await fetchAlphaVantageEvents();
      console.log(`📈 Found ${economicEvents.length} Alpha Vantage events`);
    } catch (error) {
      console.log('📈 Alpha Vantage proxy unavailable, using core data only');
    }

    // Combine and ensure we always have some data
    const allEvents = [...fomcEvents, ...earningsEvents, ...economicEvents];
    
    const finalEvents = allEvents
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .filter(event => event.date > new Date())
      .slice(0, 15); // Perfect amount for demo

    console.log(`✅ Returning ${finalEvents.length} total events`);
    return finalEvents;

  } catch (error) {
    console.error('❌ Error fetching market events:', error);
    
    // Ultimate fallback - ensure demo always works
    console.log('🔄 Using ultimate fallback: demo earnings data');
    return await getDemoEarningsEvents(ticker);
  }
} 
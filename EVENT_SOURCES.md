# Free Event Data Sources for Trading Tool

This document outlines the free sources for market event dates that have been integrated into your volatility trading tool.

## 🔗 Available Sources

### 1. **FRED (Federal Reserve Economic Data)**
- **Cost**: Free
- **Setup**: Register at https://fred.stlouisfed.org/docs/api/fred/
- **Rate Limit**: 120 requests per 60 seconds
- **Provides**: Economic releases, FOMC meetings, interest rate decisions
- **Environment Variable**: `FRED_API_KEY`

### 2. **Alpha Vantage**
- **Cost**: Free tier (500 requests/day)
- **Setup**: Get API key at https://www.alphavantage.co/support/#api-key
- **Provides**: Economic events, news sentiment analysis
- **Environment Variable**: `ALPHAVANTAGE_API_KEY`

### 3. **Financial Modeling Prep**
- **Cost**: Free tier (250 requests/day)
- **Setup**: Register at https://financialmodelingprep.com/developer/docs
- **Provides**: Earnings calendar, economic events
- **Environment Variable**: `FMP_API_KEY`

### 4. **IEX Cloud**
- **Cost**: Generous free tier
- **Setup**: Register at https://iexcloud.io/console/
- **Provides**: Earnings calendar, market data
- **Environment Variable**: `IEX_API_KEY`

### 5. **Federal Reserve Direct**
- **Cost**: Completely free
- **Setup**: No API key required
- **URL**: https://www.federalreserve.gov/json/fomc.json
- **Provides**: Official FOMC meeting dates

## 🚀 Additional Free Sources (Not Yet Implemented)

### 6. **Polygon.io**
```typescript
// Free tier implementation example
async function fetchPolygonEvents(): Promise<MarketEvent[]> {
  const response = await axios.get('https://api.polygon.io/v1/marketstatus/upcoming', {
    params: { apikey: process.env.POLYGON_API_KEY }
  });
  return response.data.results.map(event => ({
    type: 'economic',
    date: new Date(event.date),
    title: event.name,
    description: event.description || '',
    historicalAvgMove: 0.5,
    expectedVolImpact: 0.8
  }));
}
```

### 7. **SEC EDGAR API**
```typescript
// Completely free, no API key needed
async function fetchSECFilings(ticker: string): Promise<MarketEvent[]> {
  const response = await axios.get(`https://data.sec.gov/api/xbrl/companyfacts/CIK${ticker}.json`, {
    headers: {
      'User-Agent': 'YourCompany contact@yourcompany.com'
    }
  });
  // Process SEC filing dates...
}
```

### 8. **TradingView Economic Calendar** (Web Scraping)
```typescript
// Requires web scraping - use cheerio
import cheerio from 'cheerio';

async function fetchTradingViewEvents(): Promise<MarketEvent[]> {
  const response = await axios.get('https://www.tradingview.com/economic-calendar/');
  const $ = cheerio.load(response.data);
  // Scrape calendar events...
}
```

## 🔧 Setup Instructions

1. **Create environment variables file**:
```bash
# Add to your .env.local file
FRED_API_KEY=your_fred_api_key_here
ALPHAVANTAGE_API_KEY=your_alphavantage_api_key_here
FMP_API_KEY=your_fmp_api_key_here
IEX_API_KEY=your_iex_api_key_here
```

2. **Install required dependencies** (if not already installed):
```bash
npm install axios cheerio  # For web scraping if needed
```

3. **Test the implementation**:
The updated `volatility.service.ts` now includes multiple sources with fallbacks, so even if some APIs are down, you'll still get event data.

## 📈 Event Types Supported

- **Earnings**: Company quarterly/annual earnings reports
- **FOMC**: Federal Open Market Committee meetings
- **Economic**: GDP releases, unemployment data, inflation reports
- **Custom**: Any manually added events

## 🔄 Fallback Strategy

The implementation uses a multi-source approach:
1. Try primary source (e.g., FMP for earnings)
2. Fall back to secondary source (e.g., IEX Cloud)
3. Final fallback to Yahoo Finance (with improved headers)
4. For FOMC: Hardcoded dates if API fails

## 🚫 Rate Limiting

All sources respect rate limits:
- FRED: 120/minute
- Alpha Vantage: 500/day
- FMP: 250/day
- IEX Cloud: Generous limits
- Federal Reserve: No limits

## 💡 Pro Tips

1. **Combine multiple sources** for better coverage
2. **Cache results** to avoid hitting rate limits
3. **Use Promise.allSettled()** to handle API failures gracefully
4. **Implement proper error handling** with fallbacks
5. **Add request timeouts** to prevent hanging requests

## 🔮 Future Enhancements

Consider adding:
- **Crypto events** (protocol upgrades, etc.)
- **International markets** (ECB, BOJ meetings)
- **Sector-specific events** (oil inventory, tech conferences)
- **Social media sentiment** indicators
- **Options expiration dates** 
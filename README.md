# Financial Dashboard

A comprehensive financial dashboard providing volatility forecasting, options analysis, and trading tools.

## Features

- **Volatility Forecast**: Advanced volatility prediction using multiple models (EWMA, GARCH, ensemble methods)
- **Options Analysis**: Real-time options data and implied volatility calculations
- **Trading Tools**: Position sizing, strategy suggestions, and risk analysis
- **Market Events**: Economic calendar integration
- **Real-time Data**: Yahoo Finance API integration with fallback mechanisms

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Python volatility models
- **Data Sources**: Yahoo Finance, VIX data
- **Deployment**: Vercel

## Local Development

```bash
npm install
npm run dev
```

## API Endpoints

- `/api/volatility/forecast` - Volatility predictions
- `/api/volatility/vix` - VIX data
- `/api/market-events` - Economic calendar
- `/api/yahoo-finance` - Market data

## Architecture

The application uses a hybrid approach:
- Next.js for the web interface and API routes
- Python models for advanced volatility calculations
- Real-time data fetching with robust error handling
- Fallback data systems for high availability

## Volatility Models

1. **Historical Volatility**: Rolling window calculations
2. **EWMA**: Exponentially weighted moving averages
3. **Ensemble Methods**: Combined forecasting approaches
4. **Implied Volatility**: Options-based calculations with VIX fallback

## Data Sources

- Yahoo Finance API for historical prices
- VIX index for implied volatility backup
- Economic calendar APIs for market events

## Error Handling

- Comprehensive fallback mechanisms
- Rate limiting protection
- Data validation and sanitization
- Graceful degradation strategies

## Performance

- Optimized API responses
- Efficient data caching
- Responsive design
- Fast chart rendering

## Security

- Input validation
- CORS configuration
- Rate limiting
- Secure API practices

## Monitoring

- Error logging
- Performance metrics
- Data quality checks
- Health monitoring endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please use the GitHub issue tracker.

---

*Last updated: June 2025 - Build fix deployed* 
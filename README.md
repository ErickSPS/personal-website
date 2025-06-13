# Volatility Forecasting Tool

A demonstration tool built to showcase volatility forecasting techniques and market data visualization. This tool uses publicly available data sources and is intended for educational purposes.

## ⚠️ Data Disclaimer

**This is a demonstration application.** The data provided is for educational purposes only and is sourced from publicly available APIs. The data may be subject to:
- Rate limits
- Delays
- Inaccuracies
- Service interruptions

**This tool is not intended for making real trading decisions.** Always verify data from official sources before making any investment decisions.

## Features

- Historical volatility calculation using rolling standard deviation of log returns
- EWMA-based volatility forecasting
- Confidence interval estimation
- Interactive Plotly visualizations
- FastAPI backend with Yahoo Finance integration
- Comprehensive test suite

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/volatility-forecasting.git
cd volatility-forecasting
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Starting the API Server

```bash
uvicorn volatility.main:app --reload
```

The API will be available at `http://localhost:8000`

### API Endpoints

- `GET /`: Health check endpoint
- `POST /forecast`: Get volatility forecast for a given ticker
  - Parameters:
    - `ticker`: Stock symbol (e.g., "SPY")
    - `window`: Rolling window size in days (default: 20)
    - `forecast_horizon`: Number of days to forecast (default: 5)
    - `confidence`: Confidence level for intervals (default: 0.95)

### Example Request

```python
import requests

response = requests.post("http://localhost:8000/forecast", json={
    "ticker": "SPY",
    "window": 20,
    "forecast_horizon": 5,
    "confidence": 0.95
})

data = response.json()
```

## Technical Details

### Volatility Calculation

The tool uses a simple and robust approach:

1. Historical Volatility:
   - Calculate daily log returns
   - Compute rolling standard deviation
   - Annualize by multiplying with sqrt(252)

2. Volatility Forecast:
   - Uses Exponentially Weighted Moving Average (EWMA)
   - Industry-standard decay factor of 0.94
   - Projects volatility forward using decay

3. Confidence Intervals:
   - Based on historical volatility standard deviation
   - Uses normal distribution assumptions
   - Provides upper and lower bounds for forecasts

## Testing

Run the test suite:

```bash
pytest tests/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 
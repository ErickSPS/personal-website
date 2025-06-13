from fastapi.testclient import TestClient
import pytest
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from unittest.mock import patch
import yfinance as yf

from api.main import app

client = TestClient(app)

@pytest.fixture
def mock_yf_data():
    """Mock yfinance data for testing."""
    dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
    np.random.seed(42)
    returns = np.random.normal(0, 0.01, 100)
    prices = 100 * np.exp(np.cumsum(returns))
    data = pd.DataFrame({
        'Open': prices,
        'High': prices * 1.01,
        'Low': prices * 0.99,
        'Close': prices,
        'Volume': np.random.randint(1000000, 10000000, 100)
    }, index=dates)
    return data

@pytest.fixture
def mock_yf_download(mock_yf_data):
    """Mock yfinance download function."""
    with patch('yfinance.download') as mock:
        mock.return_value = mock_yf_data
        yield mock

def test_volatility_forecast_endpoint(mock_yf_download):
    """Test the volatility forecast endpoint with valid data."""
    request_data = {
        "ticker": "SPY",
        "historical_window": 30,
        "forecast_horizon": 5,
        "confidence_level": 0.95
    }
    
    response = client.post("/api/volatility/forecast", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "historical_data" in data
    assert "forecast_data" in data
    assert "ensemble_forecast" in data
    assert "dates" in data
    assert "forecast_dates" in data
    assert "model_weights" in data
    assert "volatility_chart" in data
    assert "residuals_chart" in data
    
    # Check data types and lengths
    assert isinstance(data["historical_data"], list)
    assert isinstance(data["forecast_data"], list)
    assert isinstance(data["ensemble_forecast"], list)
    assert len(data["forecast_data"]) == request_data["forecast_horizon"]
    assert len(data["ensemble_forecast"]) == request_data["forecast_horizon"]
    
    # Check model weights
    assert isinstance(data["model_weights"], dict)
    assert sum(data["model_weights"].values()) == pytest.approx(1.0)
    assert all(w >= 0 for w in data["model_weights"].values())

def test_invalid_ticker(mock_yf_download):
    """Test the endpoint with an invalid ticker."""
    mock_yf_download.side_effect = ValueError("No data found for ticker")
    
    request_data = {
        "ticker": "INVALID_TICKER_123",
        "historical_window": 30,
        "forecast_horizon": 5
    }
    
    response = client.post("/api/volatility/forecast", json=request_data)
    assert response.status_code == 404
    assert "No data found for ticker" in response.json()["detail"]

def test_invalid_parameters(mock_yf_download):
    """Test the endpoint with invalid parameters."""
    # Test with negative historical window
    request_data = {
        "ticker": "SPY",
        "historical_window": -1,
        "forecast_horizon": 5
    }
    
    response = client.post("/api/volatility/forecast", json=request_data)
    assert response.status_code == 422  # Validation error
    
    # Test with zero forecast horizon
    request_data = {
        "ticker": "SPY",
        "historical_window": 30,
        "forecast_horizon": 0
    }
    
    response = client.post("/api/volatility/forecast", json=request_data)
    assert response.status_code == 422  # Validation error
    
    # Test with invalid confidence level
    request_data = {
        "ticker": "SPY",
        "historical_window": 30,
        "forecast_horizon": 5,
        "confidence_level": 2.0
    }
    
    response = client.post("/api/volatility/forecast", json=request_data)
    assert response.status_code == 422  # Validation error

@pytest.mark.parametrize("ticker", ["SPY", "AAPL", "GOOGL"])
def test_multiple_tickers(mock_yf_download, ticker):
    """Test the endpoint with different tickers."""
    request_data = {
        "ticker": ticker,
        "historical_window": 30,
        "forecast_horizon": 5
    }
    
    response = client.post("/api/volatility/forecast", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["historical_data"]) > 0
    assert len(data["forecast_data"]) == request_data["forecast_horizon"]

def test_chart_data(mock_yf_download):
    """Test the chart data in the response."""
    request_data = {
        "ticker": "SPY",
        "historical_window": 30,
        "forecast_horizon": 5
    }
    
    response = client.post("/api/volatility/forecast", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    
    # Check volatility chart
    vol_chart = data["volatility_chart"]
    assert "data" in vol_chart
    assert "layout" in vol_chart
    
    # Check residuals chart
    res_chart = data["residuals_chart"]
    assert "data" in res_chart
    assert "layout" in res_chart 
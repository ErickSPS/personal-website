"""
Test suite for volatility calculations.
"""
import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from volatility.models import (
    calculate_volatility,
    forecast_volatility,
    get_confidence_intervals
)

@pytest.fixture
def sample_price_data():
    """Create sample price data for testing."""
    dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='B')
    # Generate random walk prices
    np.random.seed(42)
    returns = np.random.normal(0.0001, 0.02, size=len(dates))
    prices = 100 * np.exp(np.cumsum(returns))
    return pd.Series(prices, index=dates)

def test_calculate_volatility(sample_price_data):
    """Test basic volatility calculation."""
    vol = calculate_volatility(sample_price_data, window=20)
    
    assert isinstance(vol, pd.Series)
    assert len(vol) == len(sample_price_data)
    assert not vol.isnull().all()
    assert (vol >= 0).all()  # Volatility should be non-negative

def test_forecast_volatility(sample_price_data):
    """Test volatility forecasting."""
    forecast = forecast_volatility(
        sample_price_data,
        forecast_horizon=5,
        decay=0.94,
        window=20
    )
    
    assert isinstance(forecast, pd.Series)
    assert len(forecast) == 5
    assert not forecast.isnull().any()
    assert (forecast > 0).all()  # Forecasts should be positive
    assert forecast.index[0] > sample_price_data.index[-1]  # Forecast should start after last price

def test_confidence_intervals(sample_price_data):
    """Test confidence interval calculation."""
    forecast = forecast_volatility(sample_price_data)
    historical_std = calculate_volatility(sample_price_data).std()
    
    lower, upper = get_confidence_intervals(
        forecast,
        historical_std,
        confidence=0.95
    )
    
    assert isinstance(lower, pd.Series)
    assert isinstance(upper, pd.Series)
    assert len(lower) == len(upper) == len(forecast)
    assert (upper > lower).all()  # Upper bound should be higher than lower bound
    assert (forecast >= lower).all() and (forecast <= upper).all()  # Forecast should be within bounds

def test_invalid_inputs():
    """Test error handling for invalid inputs."""
    with pytest.raises(ValueError):
        calculate_volatility(pd.Series([100]), window=20)  # Too few prices
        
    with pytest.raises(ValueError):
        calculate_volatility(pd.Series([100, 200]), window=1)  # Invalid window
        
    # Test with non-numeric data
    with pytest.raises(Exception):
        calculate_volatility(pd.Series(['a', 'b', 'c'])) 
"""
Simple and robust volatility calculations and forecasting.
"""
import numpy as np
import pandas as pd
from arch import arch_model
from typing import Dict, Optional, Tuple
from sklearn.preprocessing import MinMaxScaler

def calculate_volatility(prices: pd.Series, window: int = 20) -> pd.Series:
    """
    Calculate historical volatility using simple rolling standard deviation of log returns.
    
    Args:
        prices: Daily closing prices
        window: Rolling window size in days
        
    Returns:
        Annualized volatility in percentage
    """
    if len(prices) < 2:
        raise ValueError("Need at least 2 price points to calculate volatility")
    if window < 2:
        raise ValueError("Window size must be at least 2")
        
    # Calculate log returns
    log_returns = np.log(prices / prices.shift(1))
    
    # Calculate annualized volatility
    volatility = log_returns.rolling(window=window).std() * np.sqrt(252) * 100
    
    return volatility

def forecast_volatility(prices: pd.Series, 
                       forecast_horizon: int = 5,
                       decay: float = 0.94,
                       window: int = 20) -> pd.Series:
    """
    Generate volatility forecast using EWMA (Exponentially Weighted Moving Average).
    
    Args:
        prices: Daily closing prices
        forecast_horizon: Number of days to forecast
        decay: EWMA decay factor (0.94 is industry standard)
        window: Historical window for initial volatility
        
    Returns:
        Forecasted daily volatility for the next forecast_horizon days
    """
    # Get current volatility
    current_vol = calculate_volatility(prices, window).iloc[-1]
    
    # Generate future dates
    last_date = prices.index[-1]
    future_dates = pd.date_range(
        start=last_date + pd.Timedelta(days=1),
        periods=forecast_horizon,
        freq='B'  # Business days
    )
    
    # Simple forecast using decay factor
    forecasts = [current_vol * (decay ** i) for i in range(forecast_horizon)]
    
    return pd.Series(forecasts, index=future_dates)

def get_confidence_intervals(forecast: pd.Series, 
                           historical_std: float,
                           confidence: float = 0.95) -> Tuple[pd.Series, pd.Series]:
    """
    Calculate confidence intervals for volatility forecast.
    
    Args:
        forecast: Forecasted volatility
        historical_std: Historical standard deviation of volatility
        confidence: Confidence level (default 95%)
        
    Returns:
        Tuple of (lower bound, upper bound)
    """
    z_score = abs(np.percentile(np.random.standard_normal(10000), confidence * 100))
    
    lower_bound = forecast - z_score * historical_std
    upper_bound = forecast + z_score * historical_std
    
    return lower_bound, upper_bound

def calculate_historical_volatility(prices: pd.Series, window: int = 20) -> pd.Series:
    """Calculate historical volatility using rolling window standard deviation."""
    if len(prices) < 2:
        raise ValueError("Price series must have at least 2 data points")
    if window < 2 or window > len(prices):
        raise ValueError("Window size must be between 2 and the length of the price series")
    
    # Calculate log returns
    log_returns = np.log(prices / prices.shift(1))
    
    # Calculate annualized volatility (always non-negative due to abs)
    volatility = np.abs(log_returns.rolling(window=window).std() * np.sqrt(252) * 100)
    
    # Only drop NaN values after window - 1 points (keep the same length as input minus window - 1)
    return volatility.iloc[window-1:]

def calculate_garch_forecast(prices: pd.Series, forecast_horizon: int = 5) -> pd.Series:
    """Calculate volatility forecast using GARCH(1,1) model."""
    # Calculate log returns
    log_returns = 100 * np.log(prices / prices.shift(1)).dropna()
    
    # Fit GARCH model with non-negative constraints
    model = arch_model(log_returns, vol='Garch', p=1, q=1, dist='normal')
    model_fit = model.fit(disp='off', show_warning=False)
    
    # Generate forecast
    forecast = model_fit.forecast(horizon=forecast_horizon)
    conditional_vol = np.sqrt(forecast.variance.iloc[-1]) * np.sqrt(252)
    
    # Ensure non-negative values
    conditional_vol = np.abs(conditional_vol)
    
    # Create forecast series with future dates
    last_date = prices.index[-1]
    forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), 
                                 periods=forecast_horizon, 
                                 freq='B')
    
    return pd.Series(conditional_vol, index=forecast_dates)

def calculate_ewma_forecast(prices: pd.Series, 
                          forecast_horizon: int = 5, 
                          lambda_param: float = 0.94) -> pd.Series:
    """Calculate volatility forecast using EWMA model."""
    # Calculate log returns
    log_returns = np.log(prices / prices.shift(1)).dropna()
    
    # Calculate EWMA variance
    ewma_var = pd.Series(index=log_returns.index)
    ewma_var.iloc[0] = log_returns.iloc[0] ** 2
    
    for t in range(1, len(log_returns)):
        ewma_var.iloc[t] = (lambda_param * ewma_var.iloc[t-1] + 
                           (1 - lambda_param) * log_returns.iloc[t] ** 2)
    
    # Generate forecast
    last_var = ewma_var.iloc[-1]
    forecast_var = np.array([last_var] * forecast_horizon)
    
    # Convert to annualized volatility
    forecast_vol = np.sqrt(forecast_var) * np.sqrt(252) * 100
    
    # Create forecast series with future dates
    last_date = prices.index[-1]
    forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), 
                                 periods=forecast_horizon, 
                                 freq='B')
    
    return pd.Series(forecast_vol, index=forecast_dates)

def calculate_parkinson_volatility(ohlc_data: pd.DataFrame, 
                                 window: int = 20) -> pd.Series:
    """Calculate Parkinson volatility using high-low price range."""
    if 'High' not in ohlc_data.columns or 'Low' not in ohlc_data.columns:
        raise ValueError("OHLC data must contain 'High' and 'Low' columns")
    
    # Calculate Parkinson estimator
    high_low_ratio = np.log(ohlc_data['High'] / ohlc_data['Low'])
    parkinson_estimator = (1 / (4 * np.log(2))) * (high_low_ratio ** 2)
    
    # Calculate rolling volatility
    volatility = np.sqrt(parkinson_estimator.rolling(window=window).mean()) * np.sqrt(252) * 100
    
    return volatility.dropna()

class VolatilityEnsemble:
    """Ensemble model combining multiple volatility forecasting methods."""
    
    def __init__(self, historical_window: int = 30, forecast_horizon: int = 5):
        self.historical_window = historical_window
        self.forecast_horizon = forecast_horizon
        self.model_weights: Dict[str, float] = {}
        self.scaler = MinMaxScaler()
        self.is_fitted = False
        self.prices: Optional[pd.Series] = None
    
    def fit(self, prices: pd.Series, ohlc_data: Optional[pd.DataFrame] = None) -> None:
        """Fit the ensemble model using historical data."""
        self.prices = prices.copy()  # Store prices for later use
        
        # Calculate historical performance for each model
        garch_vol = calculate_garch_forecast(prices, self.forecast_horizon)
        ewma_vol = calculate_ewma_forecast(prices, self.forecast_horizon)
        hist_vol = calculate_historical_volatility(prices, self.historical_window)
        
        models_vol = {
            'garch': garch_vol.mean(),
            'ewma': ewma_vol.mean(),
            'historical': hist_vol.iloc[-1]
        }
        
        if ohlc_data is not None:
            park_vol = calculate_parkinson_volatility(ohlc_data, self.historical_window)
            models_vol['parkinson'] = park_vol.iloc[-1]
        
        # Calculate weights based on inverse variance
        variances = np.array(list(models_vol.values()))
        inv_variance = 1 / (variances + 1e-10)  # Add small constant to avoid division by zero
        weights = inv_variance / np.sum(inv_variance)
        
        self.model_weights = dict(zip(models_vol.keys(), weights))
        self.is_fitted = True
    
    def predict(self) -> pd.Series:
        """Generate ensemble forecast."""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before making predictions")
        if self.prices is None:
            raise ValueError("No price data available. Call fit() first.")
        
        # Combine forecasts using learned weights
        weighted_forecast = 0
        for model_name, weight in self.model_weights.items():
            if model_name == 'garch':
                forecast = calculate_garch_forecast(self.prices, self.forecast_horizon)
            elif model_name == 'ewma':
                forecast = calculate_ewma_forecast(self.prices, self.forecast_horizon)
            else:
                continue  # Skip historical and Parkinson for forecasting
            
            weighted_forecast += weight * forecast
        
        # Ensure non-negative values
        weighted_forecast = pd.Series(
            np.abs(weighted_forecast),
            index=weighted_forecast.index
        )
        
        return weighted_forecast
    
    def get_model_weights(self) -> Dict[str, float]:
        """Return the current model weights."""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before accessing weights")
        return self.model_weights.copy() 
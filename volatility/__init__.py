"""
Volatility forecasting package using ensemble methods.
"""

from .models import (
    calculate_historical_volatility,
    calculate_garch_forecast,
    calculate_ewma_forecast,
    calculate_parkinson_volatility,
    VolatilityEnsemble
)

__all__ = [
    'calculate_historical_volatility',
    'calculate_garch_forecast',
    'calculate_ewma_forecast',
    'calculate_parkinson_volatility',
    'VolatilityEnsemble'
] 
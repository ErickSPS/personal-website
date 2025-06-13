import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
from typing import Optional, Dict, List
import numpy as np
from scipy.stats import norm
from datetime import datetime

def create_volatility_plot(
    historical_dates: List[str],
    historical_volatility: List[float],
    forecast_dates: List[str],
    forecast_volatility: List[float],
    lower_bound: List[float],
    upper_bound: List[float],
    ticker: str
) -> dict:
    """
    Create an interactive plot showing historical volatility and forecast.
    
    Args:
        historical_dates: List of dates for historical data
        historical_volatility: List of historical volatility values
        forecast_dates: List of dates for forecast
        forecast_volatility: List of forecasted volatility values
        lower_bound: Lower confidence bound
        upper_bound: Upper confidence bound
        ticker: Stock ticker symbol
        
    Returns:
        Plotly figure as dictionary
    """
    # Create figure
    fig = go.Figure()
    
    # Add historical volatility
    fig.add_trace(
        go.Scatter(
            x=historical_dates,
            y=historical_volatility,
            name="Historical Volatility",
            line=dict(color='blue')
        )
    )
    
    # Add forecast
    fig.add_trace(
        go.Scatter(
            x=forecast_dates,
            y=forecast_volatility,
            name="Volatility Forecast",
            line=dict(color='red', dash='dash')
        )
    )
    
    # Add confidence interval
    fig.add_trace(
        go.Scatter(
            x=forecast_dates + forecast_dates[::-1],
            y=upper_bound + lower_bound[::-1],
            fill='toself',
            fillcolor='rgba(255,0,0,0.1)',
            line=dict(color='rgba(255,0,0,0)'),
            name="95% Confidence Interval"
        )
    )
    
    # Update layout
    fig.update_layout(
        title=f"Volatility Forecast for {ticker}",
        xaxis_title="Date",
        yaxis_title="Volatility (%)",
        hovermode='x unified',
        showlegend=True,
        template="plotly_white"
    )
    
    return fig.to_dict()

def create_volatility_chart(
    historical_data: pd.Series,
    forecast_data: pd.Series,
    ensemble_forecast: pd.Series,
    model_weights: Dict[str, float],
    title: str = "Volatility Forecast",
    show_confidence_intervals: bool = True,
    confidence_level: float = 0.95
) -> go.Figure:
    """Create a Plotly figure showing historical and forecast volatility."""
    # Convert all data to lists for JSON serialization
    hist_data = historical_data.fillna(0).tolist()
    hist_dates = historical_data.index.strftime('%Y-%m-%d').tolist()
    forecast_data_list = forecast_data.fillna(0).tolist()
    forecast_dates = forecast_data.index.strftime('%Y-%m-%d').tolist()
    ensemble_data = ensemble_forecast.fillna(0).tolist()
    ensemble_dates = ensemble_forecast.index.strftime('%Y-%m-%d').tolist()
    
    # Create figure
    fig = go.Figure()
    
    # Add historical data
    fig.add_trace(go.Scatter(
        x=hist_dates,
        y=hist_data,
        name='Historical Volatility',
        mode='lines',
        line=dict(color='blue')
    ))
    
    # Add GARCH forecast
    fig.add_trace(go.Scatter(
        x=forecast_dates,
        y=forecast_data_list,
        name='GARCH Forecast',
        mode='lines',
        line=dict(color='red', dash='dash')
    ))
    
    # Add ensemble forecast
    fig.add_trace(go.Scatter(
        x=ensemble_dates,
        y=ensemble_data,
        name='Ensemble Forecast',
        mode='lines',
        line=dict(color='green', dash='dash')
    ))
    
    # Add confidence intervals if requested
    if show_confidence_intervals:
        z_score = norm.ppf((1 + confidence_level) / 2)
        std_dev = np.std(historical_data.dropna())
        
        upper_bound = [x + z_score * std_dev for x in ensemble_data]
        lower_bound = [x - z_score * std_dev for x in ensemble_data]
        
        fig.add_trace(go.Scatter(
            x=ensemble_dates,
            y=upper_bound,
            name=f'{confidence_level*100}% CI Upper',
            mode='lines',
            line=dict(color='gray', dash='dot'),
            opacity=0.3
        ))
        
        fig.add_trace(go.Scatter(
            x=ensemble_dates,
            y=lower_bound,
            name=f'{confidence_level*100}% CI Lower',
            mode='lines',
            line=dict(color='gray', dash='dot'),
            opacity=0.3,
            fill='tonexty'
        ))
    
    # Update layout
    fig.update_layout(
        title=title,
        xaxis_title='Date',
        yaxis_title='Volatility (%)',
        showlegend=True,
        height=800
    )
    
    return fig

def plot_model_residuals(
    historical_data: pd.Series,
    forecast_data: pd.Series,
    ensemble_forecast: pd.Series
) -> go.Figure:
    """Create a Plotly figure showing model residuals analysis."""
    # Convert data to lists for JSON serialization
    hist_data = historical_data.fillna(0).tolist()
    forecast_data_list = forecast_data.fillna(0).tolist()
    ensemble_data = ensemble_forecast.fillna(0).tolist()
    
    # Calculate residuals
    garch_residuals = [f - h for f, h in zip(forecast_data_list[-len(hist_data):], hist_data)]
    ensemble_residuals = [f - h for f, h in zip(ensemble_data[-len(hist_data):], hist_data)]
    
    # Create figure
    fig = go.Figure()
    
    # Add GARCH residuals
    fig.add_trace(go.Box(
        y=garch_residuals,
        name='GARCH Residuals',
        boxpoints='all',
        jitter=0.3,
        pointpos=-1.8
    ))
    
    # Add ensemble residuals
    fig.add_trace(go.Box(
        y=ensemble_residuals,
        name='Ensemble Residuals',
        boxpoints='all',
        jitter=0.3,
        pointpos=-1.8
    ))
    
    # Update layout
    fig.update_layout(
        title='Residuals Analysis',
        yaxis_title='Residual Value',
        showlegend=True,
        height=800
    )
    
    return fig 
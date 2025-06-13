"""
FastAPI application for volatility forecasting.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional

from .models import calculate_volatility, forecast_volatility, get_confidence_intervals

app = FastAPI(title="Volatility Forecasting API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VolatilityRequest(BaseModel):
    ticker: str
    window: int = 20
    forecast_horizon: int = 5
    confidence: float = 0.95

class VolatilityResponse(BaseModel):
    ticker: str
    historical_dates: List[str]
    historical_volatility: List[float]
    forecast_dates: List[str]
    forecast_volatility: List[float]
    lower_bound: List[float]
    upper_bound: List[float]

@app.get("/")
async def root():
    return {"message": "Volatility Forecasting API"}

@app.post("/forecast", response_model=VolatilityResponse)
async def get_volatility_forecast(request: VolatilityRequest):
    try:
        # Get historical data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=request.window * 2)  # Get extra data for better calculations
        
        ticker = yf.Ticker(request.ticker)
        df = ticker.history(start=start_date, end=end_date)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for ticker {request.ticker}")
            
        # Calculate historical volatility
        hist_vol = calculate_volatility(df['Close'], window=request.window)
        hist_vol = hist_vol.dropna()
        
        # Generate forecast
        forecast = forecast_volatility(
            df['Close'],
            forecast_horizon=request.forecast_horizon,
            window=request.window
        )
        
        # Calculate confidence intervals
        historical_std = hist_vol.std()
        lower_bound, upper_bound = get_confidence_intervals(
            forecast,
            historical_std,
            confidence=request.confidence
        )
        
        return VolatilityResponse(
            ticker=request.ticker,
            historical_dates=hist_vol.index.strftime('%Y-%m-%d').tolist(),
            historical_volatility=hist_vol.tolist(),
            forecast_dates=forecast.index.strftime('%Y-%m-%d').tolist(),
            forecast_volatility=forecast.tolist(),
            lower_bound=lower_bound.tolist(),
            upper_bound=upper_bound.tolist()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
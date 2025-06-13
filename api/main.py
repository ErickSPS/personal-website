from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import json
from typing import List, Dict, Optional

from volatility.models import (
    calculate_historical_volatility,
    calculate_garch_forecast,
    calculate_ewma_forecast,
    calculate_parkinson_volatility,
    VolatilityEnsemble
)
from volatility.visualization import create_volatility_chart, plot_model_residuals

app = FastAPI(title="Volatility Forecast API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VolatilityRequest(BaseModel):
    ticker: str
    historical_window: int = Field(default=30, gt=0)
    forecast_horizon: int = Field(default=5, gt=0)
    confidence_level: float = Field(default=0.95, gt=0, lt=1)

    @validator('ticker')
    def validate_ticker(cls, v):
        if not v or not isinstance(v, str) or len(v) > 10:
            raise ValueError("Invalid ticker symbol")
        return v.upper()

class VolatilityResponse(BaseModel):
    historical_data: List[float]
    forecast_data: List[float]
    ensemble_forecast: List[float]
    dates: List[str]
    forecast_dates: List[str]
    model_weights: Dict[str, float]
    volatility_chart: dict
    residuals_chart: dict

@app.post("/api/volatility/forecast", response_model=VolatilityResponse)
async def get_volatility_forecast(request: VolatilityRequest):
    try:
        # Fetch historical data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=request.historical_window * 2)  # Extra data for better modeling
        
        try:
            hist_data = yf.download(
                request.ticker,
                start=start_date,
                end=end_date,
                progress=False
            )
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"No data found for ticker {request.ticker}"
            )
        
        if hist_data.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No data found for ticker {request.ticker}"
            )
        
        if len(hist_data) < request.historical_window:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient historical data for ticker {request.ticker}. " \
                       f"Need at least {request.historical_window} days, but got {len(hist_data)} days."
            )
        
        # Calculate volatilities
        prices = hist_data['Close']
        ohlc_data = hist_data[['High', 'Low']]
        
        try:
            # Initialize ensemble model
            ensemble = VolatilityEnsemble(
                historical_window=request.historical_window,
                forecast_horizon=request.forecast_horizon
            )
            
            # Fit ensemble and generate forecasts
            ensemble.fit(prices, ohlc_data)
            ensemble_forecast = ensemble.predict()
            
            # Get individual model forecasts
            garch_forecast = calculate_garch_forecast(prices, request.forecast_horizon)
            
            # Calculate historical volatility
            hist_vol = calculate_historical_volatility(prices, request.historical_window)
            
            # Create visualization
            vol_chart = create_volatility_chart(
                historical_data=hist_vol,
                forecast_data=garch_forecast,
                ensemble_forecast=ensemble_forecast,
                model_weights=ensemble.get_model_weights(),
                title=f"{request.ticker} Volatility Forecast",
                show_confidence_intervals=True,
                confidence_level=request.confidence_level
            )
            
            # Create residuals analysis
            residuals_chart = plot_model_residuals(
                historical_data=hist_vol,
                forecast_data=garch_forecast,
                ensemble_forecast=ensemble_forecast
            )
            
            # Convert numpy arrays and pandas series to lists
            hist_vol_list = hist_vol.fillna(0).tolist()  # Replace NaN with 0 for serialization
            garch_forecast_list = garch_forecast.fillna(0).tolist()
            ensemble_forecast_list = ensemble_forecast.fillna(0).tolist()
            dates_list = hist_vol.index.strftime('%Y-%m-%d').tolist()
            forecast_dates_list = ensemble_forecast.index.strftime('%Y-%m-%d').tolist()
            
            # Convert chart data to JSON-serializable format
            vol_chart_dict = {
                'data': [trace.to_plotly_json() for trace in vol_chart.data],
                'layout': vol_chart.layout.to_plotly_json()
            }
            residuals_chart_dict = {
                'data': [trace.to_plotly_json() for trace in residuals_chart.data],
                'layout': residuals_chart.layout.to_plotly_json()
            }
            
            return VolatilityResponse(
                historical_data=hist_vol_list,
                forecast_data=garch_forecast_list,
                ensemble_forecast=ensemble_forecast_list,
                dates=dates_list,
                forecast_dates=forecast_dates_list,
                model_weights=ensemble.get_model_weights(),
                volatility_chart=vol_chart_dict,
                residuals_chart=residuals_chart_dict
            )
            
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="An error occurred while processing the request. Please try again later."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again later."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
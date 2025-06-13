import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  const timeframe = searchParams.get('timeframe');

  if (!ticker || !timeframe) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  console.log('Proxying request for:', { ticker, timeframe });

  try {
    // Calculate dates
    const endDate = Math.floor(Date.now() / 1000);
    // Add extra days to ensure we have enough data for calculations
    const startDate = endDate - ((parseInt(timeframe) + 30) * 24 * 60 * 60);

    // Fetch data from Yahoo Finance API
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${startDate}&period2=${endDate}&interval=1d`
    );

    const result = response.data.chart.result[0];
    if (!result || !result.indicators || !result.indicators.quote || !result.indicators.quote[0]) {
      throw new Error('Invalid data structure from Yahoo Finance');
    }

    const prices = result.indicators.quote[0].close;
    const timestamps = result.timestamp;

    if (!Array.isArray(prices) || !Array.isArray(timestamps)) {
      throw new Error('Invalid price or timestamp data');
    }

    console.log('Raw data received:', {
      pricesLength: prices.length,
      timestampsLength: timestamps.length
    });

    // Convert timestamps to dates and clean the data
    const cleanedData = timestamps.map((ts, index) => {
      const price = prices[index];
      return {
        price: typeof price === 'number' && !isNaN(price) ? price : null,
        date: new Date(ts * 1000).toISOString().split('T')[0]
      };
    }).filter(item => item.price !== null);

    console.log('Cleaned data:', {
      dataPoints: cleanedData.length,
      firstDate: cleanedData[0]?.date,
      lastDate: cleanedData[cleanedData.length - 1]?.date
    });

    if (cleanedData.length < 2) {
      throw new Error('Insufficient price data available');
    }

    return NextResponse.json({
      prices: cleanedData.map(item => item.price),
      dates: cleanedData.map(item => item.date)
    });

  } catch (error) {
    console.error('Error fetching data from Yahoo Finance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
} 
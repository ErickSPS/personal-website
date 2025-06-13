import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get('source') || 'news';
  
  // API key is only on server, never exposed to client
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      events: [],
      message: 'AlphaVantage API key not configured' 
    }, { status: 200 });
  }
  
  try {
    let response;
    
    if (source === 'economic') {
      // Try economic calendar first
      response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'ECONOMIC_CALENDAR',
          apikey: apiKey
        },
        timeout: 10000
      });
      
      // If no events, fall back to news
      if (!response.data.events || response.data.events.length === 0) {
        throw new Error('No economic events, trying news');
      }
      
      const events = response.data.events.slice(0, 5).map((event: any) => ({
        type: 'economic',
        date: event.date,
        title: event.name || 'Economic Event',
        description: event.description || 'Economic indicator release',
        historicalAvgMove: 0.8,
        expectedVolImpact: 1.2
      }));
      
      return NextResponse.json({ events, source: 'economic_calendar' });
      
    } else {
      // News sentiment approach
      response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'NEWS_SENTIMENT',
          topics: 'technology,earnings,federal_reserve',
          apikey: apiKey,
          limit: 15
        },
        timeout: 10000
      });
      
      const events = response.data.feed?.slice(0, 5).map((item: any) => ({
        type: 'economic',
        date: item.time_published,
        title: item.title?.substring(0, 60) + '...' || 'Market News',
        description: item.summary?.substring(0, 120) + '...' || 'Market sentiment update',
        historicalAvgMove: 0.5,
        expectedVolImpact: 0.8
      })) || [];
      
      return NextResponse.json({ events, source: 'news_sentiment' });
    }
    
  } catch (error) {
    console.error('AlphaVantage API error:', error);
    
    // Try fallback approach
    if (source === 'economic') {
      // If economic failed, try news
      try {
        const newsResponse = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'NEWS_SENTIMENT',
            topics: 'technology,earnings',
            apikey: apiKey,
            limit: 10
          },
          timeout: 5000
        });
        
        const events = newsResponse.data.feed?.slice(0, 3).map((item: any) => ({
          type: 'economic',
          date: item.time_published,
          title: item.title?.substring(0, 50) + '...' || 'Market News',
          description: item.summary?.substring(0, 100) + '...' || 'Market update',
          historicalAvgMove: 0.4,
          expectedVolImpact: 0.6
        })) || [];
        
        return NextResponse.json({ events, source: 'news_fallback' });
      } catch (fallbackError) {
        return NextResponse.json({ 
          events: [],
          message: 'AlphaVantage temporarily unavailable' 
        }, { status: 200 });
      }
    }
    
    return NextResponse.json({ 
      events: [],
      message: 'AlphaVantage temporarily unavailable' 
    }, { status: 200 });
  }
} 
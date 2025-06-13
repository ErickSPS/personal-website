import { NextResponse } from 'next/server';
import { getVIXBasedImpliedVolatility, getCurrentVIX } from '../vix-implied-vol';

/**
 * GET /api/volatility/vix?ticker=SYMBOL
 * Get VIX-based implied volatility for a symbol
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ticker = url.searchParams.get('ticker');

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      );
    }

    const result = await getVIXBasedImpliedVolatility(ticker);

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      impliedVolatility: result.impliedVol,
      source: result.source,
      timestamp: new Date(result.timestamp).toISOString(),
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Error fetching VIX-based implied volatility:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate VIX-based implied volatility',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/volatility/vix/current
 * Get current VIX value
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tickers } = body;

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { error: 'Tickers array is required' },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      tickers.map(async (ticker: string) => {
        const result = await getVIXBasedImpliedVolatility(ticker);
        return {
          ticker: ticker.toUpperCase(),
          impliedVolatility: result.impliedVol,
          source: result.source,
          timestamp: new Date(result.timestamp).toISOString(),
          metadata: result.metadata,
        };
      })
    );

    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result, index) => ({
        ticker: tickers[index],
        error: result.reason?.message || 'Unknown error'
      }));

    return NextResponse.json({
      success: successful,
      errors: failed,
      summary: {
        total: tickers.length,
        successful: successful.length,
        failed: failed.length
      }
    });
  } catch (error) {
    console.error('Error processing batch VIX-based implied volatility:', error);
    return NextResponse.json(
      { error: 'Failed to process batch request' },
      { status: 500 }
    );
  }
} 
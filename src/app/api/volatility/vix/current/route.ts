import { NextResponse } from 'next/server';
import { getCurrentVIX } from '../../vix-implied-vol';

export async function GET() {
  try {
    const vixData = await getCurrentVIX();
    
    return NextResponse.json({
      symbol: 'VIX',
      value: vixData.price,
      timestamp: new Date(vixData.timestamp).toISOString(),
      description: 'CBOE Volatility Index',
    });
  } catch (error) {
    console.error('Error fetching current VIX:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch current VIX',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
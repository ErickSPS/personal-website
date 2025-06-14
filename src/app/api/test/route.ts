import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'OK', 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    platform: process.env.VERCEL ? 'Vercel' : 'Local'
  });
} 
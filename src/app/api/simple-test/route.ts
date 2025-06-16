import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Hello from simple test route!',
    timestamp: new Date().toISOString(),
    status: 'working'
  });
} 
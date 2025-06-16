import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Minimal test route working',
    timestamp: new Date().toISOString()
  });
} 
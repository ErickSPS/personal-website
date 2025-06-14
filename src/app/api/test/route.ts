import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({
    status: 'ok',
    timestamp,
    environment: process.env.NODE_ENV || 'unknown',
    message: 'API is working properly',
    deploymentCheck: true
  });
} 
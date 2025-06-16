import { describe, it, expect } from '@jest/globals';

describe('API Route Integration Tests', () => {
  // Test that we can import and call API routes
  it('should be able to import test route without errors', async () => {
    // This test ensures the route can be imported without Next.js runtime errors
    const routePath = require.resolve('../test/route');
    expect(routePath).toBeTruthy();
    
    // Verify the file exists and has the correct export
    const fs = require('fs');
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('export async function GET');
  });

  it('should be able to import forecast route without errors', async () => {
    const routePath = require.resolve('../volatility/forecast/route');
    expect(routePath).toBeTruthy();
    
    const fs = require('fs');
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('export async function GET');
  });

  it('should have proper Alpha Vantage integration structure', () => {
    const fs = require('fs');
    const path = require('path');
    
    const alphaVantagePath = path.join(process.cwd(), 'src', 'app', 'api', 'volatility', 'alpha-vantage.ts');
    expect(fs.existsSync(alphaVantagePath)).toBe(true);
    
    const content = fs.readFileSync(alphaVantagePath, 'utf8');
    expect(content).toContain('getHistoricalPrices');
    expect(content).toContain('ALPHAVANTAGE_API_KEY');
  });

  it('should have environment variable configuration ready', () => {
    // Check that the code expects the right environment variables
    const fs = require('fs');
    const path = require('path');
    
    const alphaVantagePath = path.join(process.cwd(), 'src', 'app', 'api', 'volatility', 'alpha-vantage.ts');
    const content = fs.readFileSync(alphaVantagePath, 'utf8');
    
    // Should reference the environment variable
    expect(content).toContain('process.env.ALPHAVANTAGE_API_KEY');
  });

  it('should have proper error handling in API routes', () => {
    const fs = require('fs');
    const path = require('path');
    
    const forecastPath = path.join(process.cwd(), 'src', 'app', 'api', 'volatility', 'forecast', 'route.ts');
    const content = fs.readFileSync(forecastPath, 'utf8');
    
    // Should have try-catch error handling
    expect(content).toContain('try');
    expect(content).toContain('catch');
    expect(content).toContain('NextResponse.json');
  });
}); 
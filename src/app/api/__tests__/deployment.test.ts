import { describe, it, expect, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Mock Next.js environment
beforeAll(() => {
  // Mock NextResponse for testing
  global.NextResponse = {
    json: (data: any, options: any = {}) => ({
      json: () => Promise.resolve(data),
      status: options.status || 200,
      headers: new Map(Object.entries(options.headers || {}))
    })
  };
});

describe('Vercel Deployment Configuration', () => {
  it('should have minimal vercel.json configuration', () => {
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    const configExists = fs.existsSync(vercelConfigPath);
    
    expect(configExists).toBe(true);
    
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    
    // Test for minimal configuration that works with Next.js 14 App Router
    expect(config).toHaveProperty('framework', 'nextjs');
    
    // Should NOT have conflicting configurations
    expect(config).not.toHaveProperty('functions');
    expect(config).not.toHaveProperty('rewrites');
    expect(config).not.toHaveProperty('build');
    
    // Should be minimal - only framework property
    expect(Object.keys(config)).toEqual(['framework']);
  });

  it('should have proper API route structure', () => {
    const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
    expect(fs.existsSync(apiDir)).toBe(true);
    
    // Test that critical API routes exist
    const testRoute = path.join(apiDir, 'test', 'route.ts');
    const forecastRoute = path.join(apiDir, 'volatility', 'forecast', 'route.ts');
    
    expect(fs.existsSync(testRoute)).toBe(true);
    expect(fs.existsSync(forecastRoute)).toBe(true);
  });

  it('should have Next.js 14+ version in package.json', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    expect(packageJson.dependencies.next).toMatch(/^[\^~]?14\./);
  });

  it('should not have conflicting next.config.js settings', () => {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    const configExists = fs.existsSync(nextConfigPath);
    
    if (configExists) {
      const configContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Should have proper CORS headers for API routes
      expect(configContent).toContain('headers()');
      expect(configContent).toContain('/api/:path*');
    }
  });
});

describe('API Route Structure', () => {
  it('should have proper route file naming convention', () => {
    const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
    
    // Check that API routes follow the App Router convention
    const routeFiles = ['test/route.ts', 'volatility/forecast/route.ts'];
    
    routeFiles.forEach(routePath => {
      const fullPath = path.join(apiDir, routePath);
      expect(fs.existsSync(fullPath)).toBe(true);
      
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content).toContain('export async function GET');
    });
  });

  it('should export proper HTTP methods from API routes', () => {
    const testRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'test', 'route.ts');
    const content = fs.readFileSync(testRoutePath, 'utf8');
    
    // Should export GET function for App Router
    expect(content).toContain('export async function GET');
    expect(content).toContain('NextResponse.json');
  });
}); 
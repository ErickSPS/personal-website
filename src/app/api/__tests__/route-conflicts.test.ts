import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('API Route Conflicts', () => {
  it('should not have conflicting Pages Router API routes', () => {
    const pagesApiDir = path.join(process.cwd(), 'pages', 'api');
    
    if (fs.existsSync(pagesApiDir)) {
      const files = fs.readdirSync(pagesApiDir);
      
      // Filter for actual API route files (not directories)
      const apiFiles = files.filter(file => 
        file.endsWith('.js') || file.endsWith('.ts')
      );
      
      // We should not have any Pages Router API files that conflict with App Router
      expect(apiFiles.length).toBe(0);
    }
  });

  it('should only have App Router API routes in src/app/api', () => {
    const srcApiDir = path.join(process.cwd(), 'src', 'app', 'api');
    expect(fs.existsSync(srcApiDir)).toBe(true);
    
    // Verify we have the expected App Router API structure
    const expectedRoutes = [
      'test/route.ts',
      'volatility/forecast/route.ts',
      'simple-test/route.ts'
    ];
    
    expectedRoutes.forEach(routePath => {
      const fullPath = path.join(srcApiDir, routePath);
      expect(fs.existsSync(fullPath)).toBe(true);
      
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content).toContain('export async function GET');
      expect(content).not.toContain('export default function handler');
    });
  });

  it('should use correct API route format for App Router', () => {
    const testRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'test', 'route.ts');
    const content = fs.readFileSync(testRoutePath, 'utf8');
    
    // Should use App Router format
    expect(content).toContain('export async function GET');
    expect(content).toContain('NextResponse.json');
    
    // Should NOT use Pages Router format
    expect(content).not.toContain('export default function handler');
    expect(content).not.toContain('req, res');
  });
}); 
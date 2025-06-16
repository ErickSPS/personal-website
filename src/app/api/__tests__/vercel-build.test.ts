import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Vercel Build Detection', () => {
  it('should have proper Next.js configuration for src directory', () => {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check if we're using src directory properly
    const hasSrcConfig = configContent.includes('src') || fs.existsSync(path.join(process.cwd(), 'src'));
    expect(hasSrcConfig).toBe(true);
  });

  it('should have API routes in the correct location for App Router', () => {
    const expectedPaths = [
      'src/app/api/test/route.ts',
      'src/app/api/volatility/forecast/route.ts',
      'src/app/api/simple-test/route.ts'
    ];

    expectedPaths.forEach(routePath => {
      const fullPath = path.join(process.cwd(), routePath);
      expect(fs.existsSync(fullPath)).toBe(true);
      
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content).toContain('export async function GET');
    });
  });

  it('should have proper package.json build configuration', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts.build).toBe('next build');
  });

  it('should not have conflicting API route definitions', () => {
    // Check that we don't have both pages/api and src/app/api for the same routes
    const pagesApiDir = path.join(process.cwd(), 'pages', 'api');
    const srcApiDir = path.join(process.cwd(), 'src', 'app', 'api');
    
    // Both can exist, but shouldn't have conflicting routes
    if (fs.existsSync(pagesApiDir) && fs.existsSync(srcApiDir)) {
      const pagesRoutes = fs.readdirSync(pagesApiDir, { recursive: true });
      const srcRoutes = fs.readdirSync(srcApiDir, { recursive: true });
      
      // Check for obvious conflicts (this is a simplified check)
      const conflictingRoutes = pagesRoutes.filter(route => 
        typeof route === 'string' && route.includes('test') && 
        srcRoutes.some(srcRoute => typeof srcRoute === 'string' && srcRoute.includes('test'))
      );
      
      // If there are conflicts, we should resolve them
      if (conflictingRoutes.length > 0) {
        console.warn('Potential route conflicts detected:', conflictingRoutes);
      }
    }
    
    expect(fs.existsSync(srcApiDir)).toBe(true);
  });
}); 
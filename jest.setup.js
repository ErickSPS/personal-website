// Add any global test setup here
require('@testing-library/jest-dom');

// Mock Next.js server components for testing
global.Request = global.Request || 
  class MockRequest {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.headers = new Map(Object.entries(options.headers || {}));
    }
  };

global.Response = global.Response || 
  class MockResponse {
    constructor(body, options = {}) {
      this.body = body;
      this.status = options.status || 200;
      this.headers = new Map(Object.entries(options.headers || {}));
    }
    
    static json(data, options = {}) {
      return new MockResponse(JSON.stringify(data), {
        ...options,
        headers: { 'content-type': 'application/json', ...options.headers }
      });
    }
  };

// Mock NextResponse for API route testing
global.NextResponse = {
  json: (data, options = {}) => ({
    json: () => Promise.resolve(data),
    status: options.status || 200,
    headers: new Map(Object.entries(options.headers || {}))
  })
}; 
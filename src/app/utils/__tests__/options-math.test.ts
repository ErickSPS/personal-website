import { bjerksundStensland2002, findImpliedVolatility, calculateATMImpliedVol } from '../options-math';
import { Option } from '@/types/options';

describe('Options Math', () => {
  describe('Bjerksund-Stensland Model', () => {
    it('should calculate American put option price correctly', () => {
      const price = bjerksundStensland2002(
        100, // spot
        100, // strike
        1,   // 1 year to expiry
        0.05, // 5% risk-free rate
        0.2,  // 20% volatility
        'put'
      );
      
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(100);
    });

    it('should handle early exercise for American puts', () => {
      const deepInMoney = bjerksundStensland2002(
        80,   // spot
        100,  // strike
        1,    // 1 year to expiry
        0.05, // 5% risk-free rate
        0.2,  // 20% volatility
        'put'
      );
      
      const atMoney = bjerksundStensland2002(
        100,  // spot
        100,  // strike
        1,    // 1 year to expiry
        0.05, // 5% risk-free rate
        0.2,  // 20% volatility
        'put'
      );

      expect(deepInMoney).toBeGreaterThan(atMoney);
    });

    it('should use Black-Scholes for calls with no dividends', () => {
      const call = bjerksundStensland2002(
        100,  // spot
        100,  // strike
        1,    // 1 year to expiry
        0.05, // 5% risk-free rate
        0.2,  // 20% volatility
        'call'
      );
      
      expect(call).toBeGreaterThan(0);
      expect(call).toBeLessThan(100);
    });
  });

  describe('Implied Volatility', () => {
    it('should find implied volatility for ATM options', () => {
      const optionData = {
        strike: 100,
        expiry: 1,
        spotPrice: 100,
        riskFreeRate: 0.05,
        optionPrice: 8.0, // Roughly 20% implied vol
        type: 'call' as const
      };

      const impliedVol = findImpliedVolatility(optionData);
      expect(impliedVol).toBeCloseTo(0.2, 2); // Should be close to 20%
    });

    it('should throw error for invalid option prices', () => {
      const invalidOption = {
        strike: 100,
        expiry: 1,
        spotPrice: 100,
        riskFreeRate: 0.05,
        optionPrice: -1, // Invalid negative price
        type: 'call' as const
      };

      expect(() => findImpliedVolatility(invalidOption)).toThrow();
    });
  });

  describe('ATM Implied Volatility', () => {
    const mockOptions: Option[] = [
      {
        strike: 98,
        expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'call',
        bid: 3.8,
        ask: 4.2,
        volume: 1000,
        openInterest: 5000,
        lastPrice: 4.0,
        change: 0,
        percentChange: 0,
        inTheMoney: true
      },
      {
        strike: 102,
        expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'put',
        bid: 3.9,
        ask: 4.3,
        volume: 1200,
        openInterest: 4800,
        lastPrice: 4.1,
        change: 0,
        percentChange: 0,
        inTheMoney: false
      }
    ];

    it('should calculate ATM implied volatility from option chain', () => {
      const impliedVol = calculateATMImpliedVol(mockOptions, 100);
      expect(impliedVol).toBeGreaterThan(0);
      expect(impliedVol).toBeLessThan(1); // Should be less than 100%
    });

    it('should throw error when no ATM options found', () => {
      const farFromMoneyOptions = mockOptions.map(opt => ({
        ...opt,
        strike: opt.strike * 2 // Double all strikes
      }));

      expect(() => calculateATMImpliedVol(farFromMoneyOptions, 100)).toThrow('No ATM options found');
    });
  });
}); 
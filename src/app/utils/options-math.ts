import { OptionType } from '@/types/options';

interface OptionData {
  strike: number;
  expiry: number; // Time to expiry in years
  spotPrice: number;
  riskFreeRate: number;
  optionPrice: number;
  type: OptionType;
}

/**
 * Bjerksund-Stensland (2002) American option approximation
 */
export function bjerksundStensland2002(
  S: number,  // Spot price
  K: number,  // Strike price
  T: number,  // Time to expiry in years
  r: number,  // Risk-free rate
  sigma: number,  // Volatility
  type: OptionType = 'call'  // Option type
): number {
  // Early exercise is never optimal for American calls on non-dividend paying stocks
  if (type === 'call' && r >= 0) {
    return blackScholes(S, K, T, r, sigma, type);
  }

  const phi = (S: number, T: number, gamma: number, H: number, I: number, r: number, sigma: number): number => {
    const lambda = (-r + gamma * sigma * sigma / 2) / (sigma * sigma);
    const d = -(Math.log(S / H) + (r + gamma * sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    const kappa = 2 * r / (sigma * sigma);
    
    return Math.exp(-r * T) * Math.pow(S, gamma) * (
      normalCDF(-d) - Math.pow(I / S, kappa) * normalCDF(-d + 2 * Math.log(I / S) / (sigma * Math.sqrt(T)))
    );
  };

  if (type === 'put') {
    const alpha = (1 - Math.exp(-r * T)) / r;
    const beta = (1 + Math.exp(-r * T)) / 2;
    const h1 = -(r * T + 2 * sigma * Math.sqrt(T)) * K / (K - alpha * S);
    const h2 = -(r * T - 2 * sigma * Math.sqrt(T)) * K / (K - beta * S);
    const I1 = K;
    const I2 = beta * S + (1 - beta) * I1;
    const alpha1 = (I1 - K) * Math.pow(I1, -h1);
    const alpha2 = (I2 - K) * Math.pow(I2, -h2);

    if (S >= I2) {
      return K - S;
    }

    return alpha1 * Math.pow(S, h1) - alpha2 * Math.pow(S, h2) + K;
  }

  return 0; // For completeness
}

/**
 * Black-Scholes option pricing formula
 */
function blackScholes(
  S: number,  // Spot price
  K: number,  // Strike price
  T: number,  // Time to expiry in years
  r: number,  // Risk-free rate
  sigma: number,  // Volatility
  type: OptionType = 'call'  // Option type
): number {
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  if (type === 'call') {
    return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  } else {
    return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
  }
}

/**
 * Standard normal cumulative distribution function
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/**
 * Newton-Raphson method to find implied volatility
 */
export function findImpliedVolatility(optionData: OptionData, tolerance: number = 0.0001, maxIterations: number = 100): number {
  let sigma = 0.5; // Initial guess
  let iteration = 0;

  while (iteration < maxIterations) {
    const price = bjerksundStensland2002(
      optionData.spotPrice,
      optionData.strike,
      optionData.expiry,
      optionData.riskFreeRate,
      sigma,
      optionData.type
    );

    const diff = price - optionData.optionPrice;

    if (Math.abs(diff) < tolerance) {
      return sigma;
    }

    // Calculate derivative numerically
    const h = 0.0001;
    const pricePlus = bjerksundStensland2002(
      optionData.spotPrice,
      optionData.strike,
      optionData.expiry,
      optionData.riskFreeRate,
      sigma + h,
      optionData.type
    );
    const vega = (pricePlus - price) / h;

    // Prevent division by zero
    if (Math.abs(vega) < 1e-10) {
      break;
    }

    sigma = sigma - diff / vega;

    // Ensure volatility stays within reasonable bounds
    sigma = Math.max(0.01, Math.min(5, sigma));
    iteration++;
  }

  throw new Error('Implied volatility calculation did not converge');
}

/**
 * Calculate implied volatility for ATM options
 */
export function calculateATMImpliedVol(options: any[], spotPrice: number, riskFreeRate: number = 0.05): number {
  // Find ATM options (closest to spot price)
  const atmOptions = options
    .filter(opt => Math.abs(opt.strike - spotPrice) / spotPrice < 0.05) // Within 5% of spot
    .sort((a, b) => Math.abs(a.strike - spotPrice) - Math.abs(b.strike - spotPrice))
    .slice(0, 2); // Take the two closest strikes

  if (atmOptions.length === 0) {
    throw new Error('No ATM options found');
  }

  // Calculate implied vol for each ATM option
  const impliedVols = atmOptions.map(opt => {
    try {
      const expiry = (new Date(opt.expiration).getTime() - new Date().getTime()) / (365 * 24 * 60 * 60 * 1000);
      
      return findImpliedVolatility({
        strike: opt.strike,
        expiry,
        spotPrice,
        riskFreeRate,
        optionPrice: (opt.bid + opt.ask) / 2, // Use mid price
        type: opt.type as OptionType
      });
    } catch (error) {
      console.error('Error calculating implied vol:', error);
      return null;
    }
  }).filter(vol => vol !== null) as number[];

  if (impliedVols.length === 0) {
    throw new Error('Failed to calculate implied volatility');
  }

  // Return average of valid implied vols
  return impliedVols.reduce((a, b) => a + b, 0) / impliedVols.length;
} 
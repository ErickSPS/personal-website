/**
 * Calculate daily returns from price array
 */
function calculateReturns(prices: number[]): number[] {
  return prices.slice(1).map((price, i) => Math.log(price / prices[i]));
}

/**
 * Calculate historical volatility using rolling window of log returns
 * @param prices Array of historical prices
 * @param window Rolling window size in days (default 30)
 * @param annualizationFactor Default 252 for trading days in a year
 * @returns Array of annualized volatility as percentages for each day
 */
export function calculateHistoricalVolatility(
  prices: number[], 
  window: number = 30,
  annualizationFactor: number = 252
): number[] {
  if (!prices.length) {
    throw new Error('Price array cannot be empty');
  }

  if (prices.length < 2) {
    return [];
  }

  // Calculate daily log returns
  const returns = calculateReturns(prices);
  const volatilities: number[] = [];
  
  // For the first window-1 days, we don't have enough data for rolling calculation
  // Fill with NaN or use expanding window
  for (let i = 0; i < Math.min(window - 1, returns.length); i++) {
    volatilities.push(NaN);
  }

  // Calculate rolling volatility for each day starting from window
  for (let i = window - 1; i < returns.length; i++) {
    const windowReturns = returns.slice(i - window + 1, i + 1);
    const mean = windowReturns.reduce((a, b) => a + b, 0) / windowReturns.length;
    const variance = windowReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (windowReturns.length - 1);
    const annualizedVol = Math.sqrt(variance * annualizationFactor) * 100;
    volatilities.push(annualizedVol);
  }

  // Pad the array to match the original prices length (add one more element since we started with returns)
  volatilities.unshift(NaN);

  return volatilities;
}

/**
 * Calculate EWMA (Exponentially Weighted Moving Average) volatility
 * @param prices Array of historical prices
 * @param lambda Decay factor (default 0.94)
 * @param annualizationFactor Default 252 for trading days in a year
 * @returns Current EWMA volatility as percentage
 */
export function calculateEWMAVolatility(
  prices: number[], 
  lambda: number = 0.94,
  annualizationFactor: number = 252
): number {
  if (!prices.length) {
    throw new Error('Price array cannot be empty');
  }

  if (lambda <= 0 || lambda >= 1) {
    throw new Error('Lambda must be between 0 and 1');
  }

  if (prices.length < 2) {
    return 0;
  }

  const returns = calculateReturns(prices);

  // Initialize variance with first return squared
  let variance = returns[0] * returns[0];

  // Calculate EWMA variance
  for (let i = 1; i < returns.length; i++) {
    variance = lambda * variance + (1 - lambda) * returns[i] * returns[i];
  }

  return Math.sqrt(variance * annualizationFactor) * 100;
}

/**
 * Calculate ensemble volatility combining multiple methods
 * @param prices Array of historical prices
 * @param window Rolling window for historical volatility
 * @returns Ensemble volatility as percentage
 */
export function calculateEnsembleVolatility(
  prices: number[],
  window: number = 30
): number {
  if (!prices.length) {
    throw new Error('Price array cannot be empty');
  }

  const historicalVols = calculateHistoricalVolatility(prices, window);
  const ewmaVolFast = calculateEWMAVolatility(prices, 0.94);
  const ewmaVolSlow = calculateEWMAVolatility(prices, 0.97);

  // Get the last valid historical volatility
  const lastHistoricalVol = historicalVols.filter(v => !isNaN(v)).pop() || 0;

  const validVols = [
    lastHistoricalVol,
    ewmaVolFast,
    ewmaVolSlow
  ].filter(v => !isNaN(v) && v > 0);

  if (validVols.length === 0) {
    return 0;
  }

  return validVols.reduce((a, b) => a + b, 0) / validVols.length;
} 
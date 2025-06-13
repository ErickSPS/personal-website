import { VolatilityAnalysis, RiskProfile } from '@/types/volatility-analysis';
import { Strategy } from '@/types/volatility';
import { MarketAnalysis, StrategyRecommendation } from '@/types/volatility.types';

const RISK_MULTIPLIERS = {
  conservative: 0.7,
  moderate: 1.0,
  aggressive: 1.3,
};

export function generateIronCondorStrategy(
  analysis: VolatilityAnalysis,
  spotPrice: number,
  riskProfile: RiskProfile
): Strategy {
  const widthMultiplier = RISK_MULTIPLIERS[riskProfile];
  const width = 0.1 * widthMultiplier; // Base 10% width adjusted by risk profile
  
  return {
    type: 'iron_condor',
    direction: 'short',
    strikes: [
      spotPrice * (1 - width * 1.2),
      spotPrice * (1 - width),
      spotPrice * (1 + width),
      spotPrice * (1 + width * 1.2),
    ],
    ratios: [-1, 1, -1, 1],
    delta: [-0.1, 0.3, -0.3, 0.1],
    vega: -0.3,
    theta: 0.2,
    expectedReturn: analysis.currentIV * 0.8,
    maxLoss: analysis.currentIV * 2,
    breakeven: [-width * 100, width * 100],
  };
}

export function generateVolatilityButterfly(
  analysis: VolatilityAnalysis,
  spotPrice: number
): Strategy {
  const width = 0.05; // 5% wings
  
  return {
    type: 'butterfly',
    direction: 'long',
    strikes: [
      spotPrice * (1 - width),
      spotPrice,
      spotPrice * (1 + width),
    ],
    ratios: [1, -2, 1],
    delta: [-0.1, 0.2, -0.1],
    vega: 0.1,
    theta: -0.05,
    expectedReturn: analysis.currentIV * 1.2,
    maxLoss: analysis.currentIV * 0.4,
    breakeven: [-3, 3],
  };
}

export function generateDirectionalSpread(
  analysis: VolatilityAnalysis,
  spotPrice: number,
  riskProfile: RiskProfile
): Strategy {
  const widthMultiplier = RISK_MULTIPLIERS[riskProfile];
  const width = 0.05 * widthMultiplier;
  const isBullish = analysis.directionalBias === 'bullish';
  
  return {
    type: 'directional_spread',
    direction: 'long',
    strikes: isBullish
      ? [spotPrice, spotPrice * (1 + width)]
      : [spotPrice * (1 - width), spotPrice],
    ratios: [1, -1],
    delta: isBullish ? [0.5, -0.2] : [-0.5, 0.2],
    vega: 0.2,
    theta: -0.1,
    expectedReturn: analysis.currentIV * 1.5,
    maxLoss: analysis.currentIV * 0.3,
    breakeven: [3],
  };
}

export function generateStraddle(
  analysis: VolatilityAnalysis,
  spotPrice: number
): Strategy {
  return {
    type: 'straddle_strangle',
    direction: analysis.volSpread > 0 ? 'short' : 'long',
    strikes: [spotPrice],
    ratios: [1],
    delta: [0],
    vega: analysis.volSpread > 0 ? -0.4 : 0.4,
    theta: analysis.volSpread > 0 ? 0.2 : -0.2,
    expectedReturn: analysis.currentIV * (analysis.volSpread > 0 ? 0.7 : 1.3),
    maxLoss: analysis.currentIV * (analysis.volSpread > 0 ? 2 : 1),
    breakeven: [-5, 5],
  };
}

export function getStrategyRecommendations(
  analysis: MarketAnalysis,
  spotPrice: number,
  riskProfile: RiskProfile
): StrategyRecommendation[] {
  const recommendations: StrategyRecommendation[] = [];
  const { volSpread, directionalBias } = analysis;

  // Volatility is expected to increase
  if (volSpread > 2) {
    if (directionalBias === 'neutral') {
      recommendations.push({
        name: 'Long Straddle',
        description: 'Buy ATM put and call options with the same strike and expiration',
        risk: 'Limited to premium paid',
        potentialReturn: 'Unlimited',
        maxLoss: `$${(spotPrice * 0.05).toFixed(2)}`,
        setup: `Buy ${spotPrice.toFixed(0)} strike put and call`
      });

      if (riskProfile === 'aggressive') {
        recommendations.push({
          name: 'Long Strangle',
          description: 'Buy OTM put and call options',
          risk: 'Limited to premium paid',
          potentialReturn: 'Unlimited',
          maxLoss: `$${(spotPrice * 0.03).toFixed(2)}`,
          setup: `Buy ${(spotPrice * 0.95).toFixed(0)} put and ${(spotPrice * 1.05).toFixed(0)} call`
        });
      }
    }

    if (directionalBias === 'bullish') {
      recommendations.push({
        name: 'Call Backspread',
        description: 'Sell ATM calls and buy more OTM calls',
        risk: 'Limited',
        potentialReturn: 'Unlimited to the upside',
        maxLoss: `$${(spotPrice * 0.04).toFixed(2)}`,
        setup: `Sell 1 ${spotPrice.toFixed(0)} call, buy 2 ${(spotPrice * 1.05).toFixed(0)} calls`
      });
    }

    if (directionalBias === 'bearish') {
      recommendations.push({
        name: 'Put Backspread',
        description: 'Sell ATM puts and buy more OTM puts',
        risk: 'Limited',
        potentialReturn: 'Unlimited to the downside',
        maxLoss: `$${(spotPrice * 0.04).toFixed(2)}`,
        setup: `Sell 1 ${spotPrice.toFixed(0)} put, buy 2 ${(spotPrice * 0.95).toFixed(0)} puts`
      });
    }
  }

  // Volatility is expected to decrease
  if (volSpread < -2) {
    if (directionalBias === 'neutral') {
      recommendations.push({
        name: 'Short Strangle',
        description: 'Sell OTM put and call options',
        risk: 'Unlimited',
        potentialReturn: 'Limited to premium received',
        maxLoss: 'Unlimited',
        setup: `Sell ${(spotPrice * 0.95).toFixed(0)} put and ${(spotPrice * 1.05).toFixed(0)} call`
      });

      if (riskProfile === 'conservative') {
        recommendations.push({
          name: 'Iron Condor',
          description: 'Sell OTM put and call spreads',
          risk: 'Limited',
          potentialReturn: 'Limited to premium received',
          maxLoss: `$${(spotPrice * 0.02).toFixed(2)}`,
          setup: `Sell ${(spotPrice * 0.95).toFixed(0)}/${(spotPrice * 0.93).toFixed(0)} put spread and ${(spotPrice * 1.05).toFixed(0)}/${(spotPrice * 1.07).toFixed(0)} call spread`
        });
      }
    }

    if (directionalBias !== 'neutral' && riskProfile !== 'conservative') {
      recommendations.push({
        name: 'Calendar Spread',
        description: 'Sell near-term ATM option and buy longer-term ATM option',
        risk: 'Limited to debit paid',
        potentialReturn: 'Limited but potentially significant',
        maxLoss: `$${(spotPrice * 0.03).toFixed(2)}`,
        setup: `Sell 30-day ${spotPrice.toFixed(0)} ${directionalBias === 'bullish' ? 'call' : 'put'}, buy 90-day ${spotPrice.toFixed(0)} ${directionalBias === 'bullish' ? 'call' : 'put'}`
      });
    }
  }

  // Add conservative strategies for small volatility changes
  if (Math.abs(volSpread) <= 2 && riskProfile === 'conservative') {
    recommendations.push({
      name: 'Covered Call',
      description: 'Own stock and sell OTM calls against it',
      risk: 'Limited to stock price minus premium received',
      potentialReturn: 'Limited to strike price minus stock price plus premium',
      maxLoss: `$${(spotPrice * 0.95).toFixed(2)}`,
      setup: `Buy stock at ${spotPrice.toFixed(2)}, sell ${(spotPrice * 1.05).toFixed(0)} call`
    });

    recommendations.push({
      name: 'Cash-Secured Put',
      description: 'Sell ATM or OTM puts with cash collateral',
      risk: 'Limited to strike price minus premium received',
      potentialReturn: 'Limited to premium received',
      maxLoss: `$${(spotPrice * 0.95).toFixed(2)}`,
      setup: `Sell ${(spotPrice * 0.95).toFixed(0)} put`
    });
  }

  return recommendations;
} 
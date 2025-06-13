export type OptionType = 'call' | 'put';

export interface Option {
  strike: number;
  expiration: string;
  type: OptionType;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  lastPrice: number;
  change: number;
  percentChange: number;
  inTheMoney: boolean;
}

export interface OptionChain {
  calls: Option[];
  puts: Option[];
  expirationDates: string[];
  strikes: number[];
}

export interface OptionGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
} 
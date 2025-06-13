export type MarketEventType = 'earnings' | 'fomc' | 'economic' | 'custom';

export interface MarketEvent {
  type: MarketEventType;
  title: string;
  date: Date;
  description: string;
  historicalAvgMove: number;
  expectedVolImpact: number;
}

export interface EventsCalendarProps {
  className?: string;
  ticker: string;
  currentVol: number;
  ensembleVol: number;
  events: MarketEvent[];
} 
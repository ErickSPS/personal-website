import { render, screen } from '@testing-library/react';
import EventsCalendar from '../EventsCalendar';

describe('EventsCalendar', () => {
  const mockEvents = [
    {
      type: 'earnings',
      title: 'Q4 Earnings',
      date: new Date('2024-01-15'),
      description: 'Fourth quarter earnings report',
      historicalAvgMove: 5.2,
      expectedVolImpact: 4.5,
    },
    {
      type: 'fomc',
      title: 'FOMC Meeting',
      date: new Date('2024-01-31'),
      description: 'Federal Reserve policy meeting',
      historicalAvgMove: 3.8,
      expectedVolImpact: 6.2,
    },
  ];

  const defaultProps = {
    ticker: 'SPY',
    currentVol: 20,
    ensembleVol: 18,
    events: mockEvents,
  };

  it('renders without crashing', () => {
    render(<EventsCalendar {...defaultProps} />);
    expect(screen.getByText('Events Calendar')).toBeInTheDocument();
  });

  it('displays event details', () => {
    render(<EventsCalendar {...defaultProps} />);
    expect(screen.getByText('Q4 Earnings')).toBeInTheDocument();
    expect(screen.getByText('FOMC Meeting')).toBeInTheDocument();
  });

  it('shows event metrics', () => {
    render(<EventsCalendar {...defaultProps} />);
    expect(screen.getByText(/Average Historical Move/i)).toBeInTheDocument();
    expect(screen.getByText(/Volatility Impact/i)).toBeInTheDocument();
  });

  it('displays recommendations for near-term events', () => {
    render(<EventsCalendar {...defaultProps} />);
    expect(screen.getByText(/Recommendation/i)).toBeInTheDocument();
  });

  it('shows situational adjustment section', () => {
    render(<EventsCalendar {...defaultProps} />);
    expect(screen.getByText('Situational Adjustment')).toBeInTheDocument();
    expect(screen.getByText(/ensemble forecast includes additional volatility buffer/i)).toBeInTheDocument();
  });

  it('displays empty state when no events', () => {
    render(<EventsCalendar {...{ ...defaultProps, events: [] }} />);
    expect(screen.getByText('No upcoming events scheduled')).toBeInTheDocument();
  });
}); 
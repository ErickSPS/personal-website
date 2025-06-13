import { render, screen } from '@testing-library/react';
import StrategySuggestions from '../StrategySuggestions';

describe('StrategySuggestions', () => {
  const defaultProps = {
    ticker: 'SPY',
    spotPrice: 400,
    impliedVol: 20,
    ensembleVol: 18,
    hasUpcomingEvents: false,
    daysToExpiry: 30,
  };

  it('renders without crashing', () => {
    render(<StrategySuggestions {...defaultProps} />);
    expect(screen.getByText('Strategy Suggestions')).toBeInTheDocument();
  });

  it('displays strategy recommendations based on volatility spread', () => {
    render(<StrategySuggestions {...defaultProps} />);
    expect(screen.getByText(/Implied volatility significantly high/i)).toBeInTheDocument();
  });

  it('shows event-adjusted strategies when events are upcoming', () => {
    render(<StrategySuggestions {...{ ...defaultProps, hasUpcomingEvents: true }} />);
    expect(screen.getByText(/Structure adapted for upcoming events/i)).toBeInTheDocument();
  });

  it('displays strategy metrics correctly', () => {
    render(<StrategySuggestions {...defaultProps} />);
    expect(screen.getByText(/Expected Return/i)).toBeInTheDocument();
    expect(screen.getByText(/Max Loss/i)).toBeInTheDocument();
    expect(screen.getByText(/Break-even/i)).toBeInTheDocument();
  });

  it('shows considerations section', () => {
    render(<StrategySuggestions {...defaultProps} />);
    expect(screen.getByText('Considerations')).toBeInTheDocument();
    expect(screen.getByText(/Suggested strategies are based on/i)).toBeInTheDocument();
  });
}); 
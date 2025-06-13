import { render, screen, fireEvent } from '@testing-library/react';
import PositionSizer from '../PositionSizer';

describe('PositionSizer', () => {
  const defaultProps = {
    accountSize: 100000,
    ticker: 'SPY',
    impliedVol: 20,
    ensembleVol: 18,
    daysToExpiry: 30,
  };

  it('renders without crashing', () => {
    render(<PositionSizer {...defaultProps} />);
    expect(screen.getByText('Position Sizer')).toBeInTheDocument();
  });

  it('allows risk percentage adjustment', () => {
    render(<PositionSizer {...defaultProps} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3' } });
    expect(screen.getByText('3% = $3,000')).toBeInTheDocument();
  });

  it('displays position suggestions based on volatility spread', () => {
    render(<PositionSizer {...defaultProps} />);
    expect(screen.getByText(/Suggested Structure/i)).toBeInTheDocument();
    expect(screen.getByText(/Capital at Risk/i)).toBeInTheDocument();
  });

  it('shows risk/return analysis', () => {
    render(<PositionSizer {...defaultProps} />);
    expect(screen.getByText('Risk/Return Analysis')).toBeInTheDocument();
    expect(screen.getByText(/Expected Return/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum Loss/i)).toBeInTheDocument();
  });

  it('displays rationale based on volatility spread', () => {
    render(<PositionSizer {...defaultProps} />);
    expect(screen.getByText(/Rationale/i)).toBeInTheDocument();
    expect(screen.getByText(/Implied volatility is significantly above/i)).toBeInTheDocument();
  });
}); 
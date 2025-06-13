import { render, screen } from '@testing-library/react';
import VolatilityThermometer from '../VolatilityThermometer';

jest.mock('next/navigation', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('react-chartjs-2', () => ({
  Line: () => null,
}));

describe('VolatilityThermometer', () => {
  const mockData = [
    {
      timestamp: '2024-01-01',
      rolling30d: 15,
      ewmaFast: 16,
      ensemble: 17,
      impliedVol: 20,
    },
    {
      timestamp: '2024-01-02',
      rolling30d: 16,
      ewmaFast: 17,
      ensemble: 18,
      impliedVol: 21,
    },
  ];

  it('renders without crashing', () => {
    render(<VolatilityThermometer data={mockData} />);
    expect(screen.getByText('Volatility Thermometer')).toBeInTheDocument();
  });

  it('displays volatility metrics', () => {
    render(<VolatilityThermometer data={mockData} />);
    expect(screen.getByText('Historical Volatility')).toBeInTheDocument();
    expect(screen.getByText('Ensemble Forecast')).toBeInTheDocument();
    expect(screen.getByText('Implied Volatility')).toBeInTheDocument();
  });

  it('shows trading signal based on volatility spread', () => {
    render(<VolatilityThermometer data={mockData} />);
    expect(screen.getByText('Trading Signal')).toBeInTheDocument();
    expect(screen.getByText(/Ensemble-IV Spread/i)).toBeInTheDocument();
  });

  it('displays interpretation guide', () => {
    render(<VolatilityThermometer data={mockData} />);
    expect(screen.getByText('Interpretation')).toBeInTheDocument();
    expect(screen.getByText(/Opportunity to sell volatility/i)).toBeInTheDocument();
    expect(screen.getByText(/Caution zone/i)).toBeInTheDocument();
    expect(screen.getByText(/Opportunity to buy volatility/i)).toBeInTheDocument();
  });
}); 
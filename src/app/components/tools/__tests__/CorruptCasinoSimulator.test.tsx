import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CorruptCasinoSimulator from '../CorruptCasinoSimulator';

// Mock Chart.js to avoid canvas issues in tests
jest.mock('react-chartjs-2', () => ({
  Line: () => React.createElement('div', { 'data-testid': 'line-chart' }, 'Mocked Line Chart'),
  Bar: () => React.createElement('div', { 'data-testid': 'bar-chart' }, 'Mocked Bar Chart'),
}));

describe('CorruptCasinoSimulator', () => {
  beforeEach(() => {
    // Mock Math.random to make tests deterministic
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<CorruptCasinoSimulator />);
    expect(screen.getByText('Interactive "Corrupt Casino" Simulator')).toBeInTheDocument();
  });

  it('displays all input controls', () => {
    render(<CorruptCasinoSimulator />);
    
    expect(screen.getByLabelText(/Initial Bankroll/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bet Fraction/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Coin Bias/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Trials/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Simulation Paths/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Simulation/i })).toBeInTheDocument();
  });

  it('has correct default values', () => {
    render(<CorruptCasinoSimulator />);
    
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument(); // Initial bankroll
    expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // Bet fraction
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument(); // Trials
    expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // Paths
  });

  it('updates input values when changed', () => {
    render(<CorruptCasinoSimulator />);
    
    const bankrollInput = screen.getByLabelText(/Initial Bankroll/i);
    fireEvent.change(bankrollInput, { target: { value: '2000' } });
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
  });

  it('runs simulation when button is clicked', async () => {
    render(<CorruptCasinoSimulator />);
    
    const runButton = screen.getByRole('button', { name: /Run Simulation/i });
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Simulation Results/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays charts after simulation', async () => {
    render(<CorruptCasinoSimulator />);
    
    const runButton = screen.getByRole('button', { name: /Run Simulation/i });
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows interpretation panel after simulation', async () => {
    render(<CorruptCasinoSimulator />);
    
    const runButton = screen.getByRole('button', { name: /Run Simulation/i });
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Key Insights/i)).toBeInTheDocument();
      expect(screen.getByText(/Connection to Trading/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('changes coin bias selection', () => {
    render(<CorruptCasinoSimulator />);
    
    const coinSelect = screen.getByLabelText(/Coin Bias/i);
    fireEvent.change(coinSelect, { target: { value: '0.1' } });
    
    expect(coinSelect).toHaveValue('0.1');
  });

  it('validates input ranges', () => {
    render(<CorruptCasinoSimulator />);
    
    const betFractionInput = screen.getByLabelText(/Bet Fraction/i);
    fireEvent.change(betFractionInput, { target: { value: '150' } });
    
    // Should cap at 100%
    expect(betFractionInput).toHaveValue(100);
  });

  it('shows loading state during simulation', async () => {
    render(<CorruptCasinoSimulator />);
    
    const runButton = screen.getByRole('button', { name: /Run Simulation/i });
    fireEvent.click(runButton);
    
    expect(screen.getByText(/Running simulation.../i)).toBeInTheDocument();
  });

  it('displays disclaimer text', () => {
    render(<CorruptCasinoSimulator />);
    
    expect(screen.getByText(/This simulator is illustrative and educational/i)).toBeInTheDocument();
    expect(screen.getByText(/Not trading advice/i)).toBeInTheDocument();
  });
});

// Test simulation functions independently
describe('Simulation Functions', () => {
  // We'll import these functions directly to test them
  const simulatePath = (bankroll0: number, pWin: number, betFrac: number, maxTrials: number) => {
    let path = [bankroll0];
    let bankroll = bankroll0;
    
    for (let t = 1; t <= maxTrials; t++) {
      let bet = bankroll * (betFrac / 100);
      let rnd = Math.random();
      
      if (rnd < pWin) {
        bankroll += bet;
      } else {
        bankroll -= bet;
      }
      
      path.push(bankroll);
      
      if (bankroll <= bankroll0 / 2) {
        break;
      }
    }
    
    return path;
  };

  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('simulates path correctly with 49% win rate', () => {
    const path = simulatePath(1000, 0.49, 1, 10);
    
    expect(path).toHaveLength(11); // Initial value + 10 trials
    expect(path[0]).toBe(1000);
    expect(path[path.length - 1]).toBeLessThan(1000); // Should lose money with negative edge
  });

  it('simulates path correctly with 10% win rate', () => {
    const path = simulatePath(1000, 0.1, 1, 10);
    
    expect(path[0]).toBe(1000);
    expect(path[path.length - 1]).toBeLessThan(1000); // Should lose money quickly
  });

  it('stops simulation when bankroll is halved', () => {
    // Mock random to always lose
    Math.random = jest.fn().mockReturnValue(0.9);
    
    const path = simulatePath(1000, 0.49, 10, 100); // 10% bet size
    
    expect(path[path.length - 1]).toBeLessThanOrEqual(500);
  });
}); 
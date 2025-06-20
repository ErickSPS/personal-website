'use client';

import React, { useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SimulationPath {
  path: number[];
  trialsToHalving: number;
}

interface SimulationParams {
  bankroll0: number;
  pWin: number;
  betFrac: number;
  trials: number;
  paths: number;
}

interface SimulationResults {
  paths: SimulationPath[];
  avgTrialsToHalving: number;
  probHalving: number;
  stats: {
    min: number;
    max: number;
    median: number;
  };
}

const CorruptCasinoSimulator: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    bankroll0: 1000,
    pWin: 0.49,
    betFrac: 1,
    trials: 1000,
    paths: 100,
  });

  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Simulation functions
  const simulatePath = (bankroll0: number, pWin: number, betFrac: number, maxTrials: number): SimulationPath => {
    const path = [bankroll0];
    let bankroll = bankroll0;
    let trialsToHalving = maxTrials;

    for (let t = 1; t <= maxTrials; t++) {
      const bet = bankroll * (betFrac / 100);
      const rnd = Math.random();
      
      if (rnd < pWin) {
        bankroll += bet;
      } else {
        bankroll -= bet;
      }
      
      path.push(bankroll);
      
      if (bankroll <= bankroll0 / 2 && trialsToHalving === maxTrials) {
        trialsToHalving = t;
        break;
      }
    }
    
    return { path, trialsToHalving };
  };

  const runSimulation = async (): Promise<void> => {
    setIsRunning(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const paths: SimulationPath[] = [];
      
      for (let i = 0; i < params.paths; i++) {
        const pathResult = simulatePath(params.bankroll0, params.pWin, params.betFrac, params.trials);
        paths.push(pathResult);
      }
      
      // Calculate statistics
      const halvingTrials = paths
        .filter(p => p.trialsToHalving < params.trials)
        .map(p => p.trialsToHalving);
      
      const avgTrialsToHalving = halvingTrials.length > 0 
        ? halvingTrials.reduce((sum, t) => sum + t, 0) / halvingTrials.length 
        : params.trials;
      
      const probHalving = halvingTrials.length / params.paths;
      
      const sortedTrials = halvingTrials.sort((a, b) => a - b);
      const stats = {
        min: sortedTrials[0] || params.trials,
        max: sortedTrials[sortedTrials.length - 1] || params.trials,
        median: sortedTrials[Math.floor(sortedTrials.length / 2)] || params.trials,
      };
      
      setResults({
        paths,
        avgTrialsToHalving,
        probHalving,
        stats,
      });
      
      setIsRunning(false);
    }, 100);
  };

  // Chart data preparation
  const pathChartData = useMemo(() => {
    if (!results) return null;

    // Show up to 10 sample paths
    const samplePaths = results.paths.slice(0, Math.min(10, results.paths.length));
    
    const datasets = samplePaths.map((pathResult, index) => ({
      label: index === 0 ? 'Sample Paths' : undefined,
      data: pathResult.path,
      borderColor: `rgba(59, 130, 246, ${0.3 + (index * 0.1)})`,
      backgroundColor: 'transparent',
      borderWidth: 1,
      pointRadius: 0,
      showLine: true,
    }));

    return {
      labels: Array.from({ length: params.trials + 1 }, (_, i) => i),
      datasets,
    };
  }, [results, params.trials]);

  const histogramData = useMemo(() => {
    if (!results) return null;

    const halvingTrials = results.paths
      .filter(p => p.trialsToHalving < params.trials)
      .map(p => p.trialsToHalving);

    if (halvingTrials.length === 0) return null;

    // Create histogram bins
    const binCount = 20;
    const min = Math.min(...halvingTrials);
    const max = Math.max(...halvingTrials);
    const binSize = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0);
    const binLabels = Array(binCount).fill(0).map((_, i) => 
      Math.round(min + (i * binSize)).toString()
    );

    halvingTrials.forEach(trial => {
      const binIndex = Math.min(Math.floor((trial - min) / binSize), binCount - 1);
      bins[binIndex]++;
    });

    return {
      labels: binLabels,
      datasets: [{
        label: 'Frequency',
        data: bins,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }],
    };
  }, [results, params.trials]);

  const getInterpretation = (): string => {
    if (!results) return '';

    const { pWin } = params;
    const { avgTrialsToHalving, probHalving } = results;

    if (pWin === 0.49) {
      return `At the 49%-win Mirror Black table, players experience bankroll halving after ~${Math.round(avgTrialsToHalving)} hands on average, 
        with ${Math.round(probHalving * 100)}% of sessions ending in significant losses. This table's subtle edge 
        keeps players seated longer, creating the illusion of fairness while systematically draining capital.`;
    } else if (pWin === 0.1) {
      return `At the 10%-win table, bankruptcy strikes swiftly (average ${Math.round(avgTrialsToHalving)} hands), 
        with ${Math.round(probHalving * 100)}% of sessions ending badly. Players quickly recognize this table's obvious corruption—but 
        most walk away before losing significant money, making it less profitable for the house.`;
    }

    return `At the ${Math.round(pWin * 100)}%-win table, players reach 50% drawdown after ~${Math.round(avgTrialsToHalving)} hands on average.`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">


      </div>

      {/* Input Controls */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4">Simulation Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="bankroll" className="block text-sm font-medium text-secondary mb-2">
              Initial Bankroll (USD)
            </label>
            <input
              id="bankroll"
              type="number"
              min="100"
              max="100000"
              value={params.bankroll0}
              onChange={(e) => setParams(prev => ({ ...prev, bankroll0: Number(e.target.value) }))}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="betFraction" className="block text-sm font-medium text-secondary mb-2">
              Bet Fraction (% of Bankroll)
            </label>
            <input
              id="betFraction"
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={params.betFrac}
              onChange={(e) => setParams(prev => ({ 
                ...prev, 
                betFrac: Math.min(100, Math.max(0.1, Number(e.target.value)))
              }))}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="coinBias" className="block text-sm font-medium text-secondary mb-2">
              Card Bias
            </label>
            <select
              id="coinBias"
              value={params.pWin}
              onChange={(e) => setParams(prev => ({ ...prev, pWin: Number(e.target.value) }))}
              className="input"
            >
              <option value={0.49}>49% win vs 51% lose (Hidden Edge)</option>
              <option value={0.1}>10% win vs 90% lose (Obvious Edge)</option>
              <option value={0.45}>45% win vs 55% lose</option>
              <option value={0.3}>30% win vs 70% lose</option>
            </select>
          </div>

          <div>
            <label htmlFor="trials" className="block text-sm font-medium text-secondary mb-2">
              Number of Trials per Path
            </label>
            <select
              id="trials"
              value={params.trials}
              onChange={(e) => setParams(prev => ({ ...prev, trials: Number(e.target.value) }))}
              className="input"
            >
              <option value={500}>500</option>
              <option value={1000}>1,000</option>
              <option value={2000}>2,000</option>
              <option value={5000}>5,000</option>
            </select>
          </div>

          <div>
            <label htmlFor="paths" className="block text-sm font-medium text-secondary mb-2">
              Simulation Paths
            </label>
            <select
              id="paths"
              value={params.paths}
              onChange={(e) => setParams(prev => ({ ...prev, paths: Number(e.target.value) }))}
              className="input"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="btn btn-primary w-full"
            >
              {isRunning ? 'Running simulation...' : 'Run Simulation'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-primary">Simulation Results</h3>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Path Chart */}
            <div className="card p-6">
              <h4 className="text-lg font-semibold mb-4">Sample Bankroll Paths</h4>
              {pathChartData && (
                <Line
                  data={pathChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: true,
                        text: 'Bankroll Over Time',
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Hand Number',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Bankroll (USD)',
                        },
                      },
                    },
                  }}
                />
              )}
            </div>

            {/* Histogram */}
            <div className="card p-6">
              <h4 className="text-lg font-semibold mb-4">Distribution of Hands to 50% Drawdown</h4>
              {histogramData ? (
                <Bar
                  data={histogramData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: true,
                        text: 'Time to Ruin Distribution',
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Hands to 50% Drawdown',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Frequency',
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-secondary py-8">
                  No paths reached 50% drawdown within the trial period.
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="card p-6">
            <h4 className="text-lg font-semibold mb-4">Summary Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(results.avgTrialsToHalving)}
                </div>
                <div className="text-sm text-secondary">Avg Hands to 50% Drawdown</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {Math.round(results.probHalving * 100)}%
                </div>
                <div className="text-sm text-secondary">Probability of 50% Drawdown</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.stats.min}
                </div>
                <div className="text-sm text-secondary">Fastest Ruin (Trials)</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {results.stats.median}
                </div>
                <div className="text-sm text-secondary">Median Ruin (Trials)</div>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="card p-6 space-y-4">
            <h4 className="text-lg font-semibold">Key Insights</h4>
            <p className="text-secondary leading-relaxed">
              {getInterpretation()}
            </p>

            <h5 className="font-semibold">Connection to Trading</h5>
            <p className="text-secondary leading-relaxed">
              A trading strategy that shows small but consistent winners can mask a larger hidden 
              negative edge, analogous to the 49%-win coin. Without thorough testing, a retail 
              trader may stay at the table until the noise-driven feedback lulls them into 
              overconfidence. Active mind & multi-order thinking: beyond observing small wins, 
              test the strategy under stress, simulate large samples, examine path behavior, 
              not just average P&L.
            </p>

            <h5 className="font-semibold">"Get to Work" Prompt</h5>
            <p className="text-secondary leading-relaxed">
              Put your own strategy through the validation checklist: <strong>Break it down</strong>—test one assumption at a time rather than the whole strategy. <strong>Count the small pennies</strong>—include every cost you've been ignoring. <strong>Test it properly</strong>—across bull markets, bear markets, and the boring stuff in between. Most importantly, <strong>stay flexible</strong>—if the data shows it doesn't work, accept it and move on. Remember: it's easier to disprove a bad idea quickly than to prove a good one slowly.
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Disclaimer:</strong> This simulator is illustrative and educational. 
          Not trading advice. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
};

export default CorruptCasinoSimulator; 
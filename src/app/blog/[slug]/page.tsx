'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarIcon, ClockIcon, TagIcon, ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import Header from '../../../components/Header';
import { notFound } from 'next/navigation';

// This would typically come from a CMS, database, or markdown files
const blogPosts = [
  {
    id: 'understanding-options-volatility',
    title: 'Understanding Options Volatility: A Comprehensive Guide',
    excerpt: 'Dive deep into the world of options volatility, exploring implied vs historical volatility, and how traders can leverage these concepts for better decision making.',
    content: `Options volatility is one of the most crucial concepts in derivatives trading, yet it remains one of the most misunderstood. In this comprehensive guide, we'll explore the intricacies of volatility, its impact on options pricing, and how traders can leverage these concepts for better decision making.

## What is Volatility?

Volatility measures the degree of variation in a trading price series over time. In the context of options, we typically deal with two main types:

**Historical Volatility** measures the actual price movements of an underlying asset over a specific period. It's calculated using the standard deviation of returns and provides insight into how much the asset's price has fluctuated in the past.

**Implied Volatility** represents the market's expectation of future volatility. It's derived from the option's market price and reflects what traders believe the volatility will be until expiration.

## The Volatility Risk Premium

One of the most important concepts in options trading is the volatility risk premium - the difference between implied and realized volatility. This premium exists because:

- **Risk Aversion**: Market participants are willing to pay a premium for protection
- **Uncertainty**: Future volatility is inherently uncertain
- **Supply and Demand**: Market dynamics affect option prices

## Trading Strategies Based on Volatility

### High IV Strategies
When implied volatility is high relative to historical norms:
- **Short Straddles/Strangles**: Collect premium betting on volatility decrease
- **Iron Condors**: Benefit from range-bound movement
- **Covered Calls**: Enhanced income generation

### Low IV Strategies  
When implied volatility is low:
- **Long Straddles/Strangles**: Position for volatility expansion
- **Calendar Spreads**: Benefit from time decay differential
- **Protective Puts**: Cheap insurance

## Risk Management Considerations

Volatility trading requires sophisticated risk management:

1. **Position Sizing**: Never risk more than you can afford to lose
2. **Diversification**: Spread risk across multiple underlyings
3. **Greeks Management**: Monitor delta, gamma, theta, and vega exposure
4. **Exit Strategies**: Define clear profit and loss targets

## Conclusion

Understanding volatility is essential for successful options trading. By mastering the relationship between historical and implied volatility, traders can identify opportunities and manage risk more effectively.

Remember: volatility trading is complex and requires continuous learning and practice. Always paper trade new strategies before risking real capital.`,
    author: 'Erick Perez',
    publishedAt: '2024-01-15',
    readTime: '8 min read',
    tags: ['Options', 'Volatility', 'Trading Strategy'],
    featured: true
  },
  {
    id: 'vix-trading-strategies',
    title: 'VIX Trading Strategies: Profiting from Market Fear',
    excerpt: 'Learn how to trade the VIX effectively, including timing entries and exits, risk management, and understanding the unique characteristics of volatility products.',
    content: `The CBOE Volatility Index (VIX) is often called the "fear gauge" of the market. Trading VIX-related products can be highly profitable but also extremely risky. This guide explores effective strategies for trading volatility.

## Understanding the VIX

The VIX measures the market's expectation of 30-day volatility based on S&P 500 index options. Key characteristics:

- **Mean Reverting**: VIX tends to revert to its long-term average of ~20
- **Negatively Correlated**: Generally moves opposite to the S&P 500
- **Spiky Nature**: Can spike dramatically during market stress

## VIX Trading Instruments

### VIX Options
- Direct exposure to volatility expectations
- European-style exercise
- Cash-settled

### VIX Futures
- More liquid than options
- Contango/backwardation dynamics
- Multiple expiration dates

### ETFs and ETNs
- **VXX, UVXY**: Short-term volatility exposure
- **SVXY, TVIX**: Inverse and leveraged products
- **VXZ**: Mid-term volatility exposure

## Trading Strategies

### 1. VIX Spike Trading
**Setup**: VIX above 30 (high fear)
**Strategy**: Short volatility expecting mean reversion
**Risk**: Extended high volatility periods

### 2. Contango Harvesting
**Setup**: VIX futures in contango
**Strategy**: Short front-month, long back-month
**Profit**: From the roll yield decay

### 3. Event-Driven Trading
**Setup**: Before major events (earnings, FOMC, elections)
**Strategy**: Long volatility before events, short after
**Timing**: Critical for success

## Risk Management

VIX trading requires strict risk management:

1. **Position Sizing**: Use small position sizes due to high volatility
2. **Stop Losses**: Set tight stops as moves can be violent
3. **Time Limits**: Don't hold positions too long
4. **Diversification**: Don't concentrate all risk in volatility trades

## Conclusion

VIX trading offers unique profit opportunities but requires deep understanding of volatility dynamics. Success depends on proper timing, risk management, and understanding the unique characteristics of volatility products.

Always remember: volatility products can lose value rapidly and are not suitable for buy-and-hold strategies.`,
    author: 'Erick Perez',
    publishedAt: '2024-01-10',
    readTime: '6 min read',
    tags: ['VIX', 'Volatility', 'Risk Management'],
    featured: false
  },
  {
    id: 'algorithmic-trading-python',
    title: 'Building Algorithmic Trading Systems with Python',
    excerpt: 'A practical guide to developing and backtesting trading algorithms using Python, covering data collection, strategy development, and risk management.',
    content: `Python has become the de facto standard for algorithmic trading development. This guide provides a comprehensive overview of building robust trading systems using Python.

## Why Python for Algorithmic Trading?

### Advantages
- **Rich Ecosystem**: NumPy, Pandas, SciPy for data analysis
- **Machine Learning**: Scikit-learn, TensorFlow, PyTorch
- **Visualization**: Matplotlib, Plotly, Seaborn
- **API Integration**: Easy connection to brokers and data providers

### Popular Libraries
Essential libraries for algorithmic trading include pandas for data manipulation, numpy for numerical computations, and specialized libraries like backtrader for backtesting.

## System Architecture

### 1. Data Layer
- **Market Data**: Real-time and historical prices
- **Fundamental Data**: Financial statements, ratios
- **Alternative Data**: News sentiment, social media, satellite imagery

### 2. Strategy Layer
- **Signal Generation**: Technical indicators, ML models
- **Portfolio Construction**: Position sizing, risk allocation
- **Execution Logic**: Order routing, slippage modeling

### 3. Risk Management Layer
- **Position Limits**: Maximum position sizes
- **Stop Losses**: Automated risk controls
- **Portfolio Metrics**: VaR, Sharpe ratio, maximum drawdown

## Sample Strategy Implementation

Here's a basic mean reversion strategy implementation:

**Strategy Logic**: 
1. Calculate rolling mean and standard deviation
2. Generate z-scores to identify extreme price movements
3. Buy when price is significantly below average (oversold)
4. Sell when price is significantly above average (overbought)

**Key Components**:
- **Lookback Period**: 20 days for statistical calculations
- **Threshold**: 2 standard deviations for signal generation
- **Risk Management**: Position sizing and stop losses

## Advanced Topics

### Machine Learning Integration
Modern algorithmic trading increasingly incorporates machine learning:
- **Feature Engineering**: Creating meaningful predictors from market data
- **Model Selection**: Choosing appropriate algorithms for market prediction
- **Cross-Validation**: Ensuring models generalize to new data

### Risk Management
Sophisticated risk management includes:
- **Kelly Criterion**: Optimal position sizing based on win/loss probability
- **Value at Risk**: Quantifying potential losses
- **Stress Testing**: Evaluating performance under adverse conditions

## Production Considerations

### 1. Data Quality
- Handle missing data and outliers
- Account for corporate actions (splits, dividends)
- Ensure data survivorship bias is addressed

### 2. Execution Issues
- Model transaction costs and slippage
- Consider market impact for large orders
- Implement proper order management

### 3. System Reliability
- Error handling and logging
- Backup systems and failover mechanisms
- Monitoring and alerting

## Best Practices

1. **Start Simple**: Begin with basic strategies before adding complexity
2. **Validate Everything**: Backtest thoroughly and validate with out-of-sample data
3. **Risk First**: Always implement risk management before profit optimization
4. **Monitor Continuously**: Track performance and system health in real-time
5. **Document Everything**: Maintain detailed documentation of strategies and systems

## Conclusion

Building algorithmic trading systems with Python requires careful attention to data quality, strategy logic, risk management, and system architecture. While the tools are powerful and accessible, success depends on rigorous development practices and continuous monitoring.

Remember: past performance doesn't guarantee future results, and all trading involves risk of loss.`,
    author: 'Erick Perez',
    publishedAt: '2024-01-05',
    readTime: '12 min read',
    tags: ['Python', 'Algorithmic Trading', 'Development'],
    featured: true
  },
  {
    id: 'market-regime-analysis',
    title: 'Market Regime Analysis: Adapting Strategies to Market Conditions',
    excerpt: 'Understanding different market regimes and how to adapt your trading strategies accordingly. Learn to identify trend, range-bound, and high volatility environments.',
    content: `Successful trading requires adapting strategies to different market conditions. This guide explores how to identify market regimes and adjust your approach accordingly.

## What are Market Regimes?

Market regimes are distinct periods characterized by specific behavioral patterns in price movements, volatility, and correlations. Common regimes include:

### 1. Trending Markets
- **Bull Markets**: Sustained upward movement
- **Bear Markets**: Sustained downward movement
- **Characteristics**: Strong directional bias, momentum persistence

### 2. Range-Bound Markets
- **Sideways Movement**: Price oscillates between support and resistance
- **Mean Reversion**: Prices tend to return to average levels
- **Low Directional Bias**: No clear trend direction

### 3. High Volatility Markets
- **Crisis Periods**: Market stress and uncertainty
- **Event-Driven**: Major news or economic events
- **Increased Correlation**: Assets move together more

## Regime Identification Methods

### 1. Technical Indicators
Common approaches include:
- **Moving Average Analysis**: Comparing short and long-term averages
- **Volatility Measures**: Rolling standard deviation of returns
- **Trend Strength**: Momentum and directional indicators

### 2. Statistical Methods
Advanced techniques include:
- **Hidden Markov Models**: Probabilistic regime detection
- **Regime-Switching Models**: Econometric approaches
- **Structural Break Tests**: Identifying regime changes

## Strategy Adaptation by Regime

### Trending Markets
**Strategies that work well:**
- Momentum strategies
- Trend following
- Breakout strategies
- Moving average crossovers

### Range-Bound Markets
**Strategies that work well:**
- Mean reversion
- Short straddles/strangles
- Pairs trading
- Support/resistance trading

### High Volatility Markets
**Strategies that work well:**
- Long volatility strategies
- Protective strategies
- Short-term mean reversion
- Event-driven strategies

## Risk Management by Regime

### Position Sizing Adjustments
- **Trending Markets**: Increase position sizes to capture momentum
- **Range-Bound Markets**: Normal position sizing
- **High Volatility Markets**: Reduce position sizes significantly

### Dynamic Stop Losses
- **Trending Markets**: Tighter stops to preserve profits
- **Volatile Markets**: Wider stops to avoid whipsaws
- **Range-Bound Markets**: Standard stop distances

## Practical Implementation

### Regime Detection Pipeline
A comprehensive system should:
1. **Combine Multiple Indicators**: Use both technical and statistical methods
2. **Monitor Regime Persistence**: Track how long regimes typically last
3. **Adapt Strategies Dynamically**: Switch approaches based on current regime
4. **Manage Transitions**: Handle regime changes smoothly

## Advanced Considerations

### 1. Regime Persistence
- Model how long regimes typically last
- Avoid over-trading on regime changes
- Use confidence intervals for regime predictions

### 2. Multiple Time Frames
- Analyze regimes across different time horizons
- Daily, weekly, and monthly regime analysis
- Hierarchical regime structures

### 3. Asset-Specific Regimes
- Different assets may have different regime characteristics
- Sector rotation based on regime analysis
- Currency and commodity regime considerations

## Conclusion

Market regime analysis is a powerful tool for adaptive trading strategies. By identifying the current market environment and adjusting strategies accordingly, traders can improve risk-adjusted returns and reduce drawdowns.

Key takeaways:
1. Use multiple methods to identify regimes
2. Adapt both strategy and risk management to regimes
3. Avoid over-fitting to historical regime patterns
4. Consider regime persistence and transition probabilities

Remember: regime analysis is a tool to improve decision-making, not a crystal ball for predicting the future.`,
    author: 'Erick Perez',
    publishedAt: '2024-01-01',
    readTime: '10 min read',
    tags: ['Market Analysis', 'Strategy', 'Risk Management'],
    featured: false
  }
];

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPost({ params }: BlogPostPageProps) {
  const post = blogPosts.find(p => p.id === params.slug);

  if (!post) {
    notFound();
  }

  // Simple markdown-like rendering for content
  const renderContent = (content: string) => {
    const sections = content.split('\n\n');
    return sections.map((section, index) => {
      if (section.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-semibold mb-4 mt-8 text-primary">
            {section.substring(3)}
          </h2>
        );
      }
      if (section.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold mb-3 mt-6 text-primary">
            {section.substring(4)}
          </h3>
        );
      }
      if (section.includes('**') && section.includes(':')) {
        // Handle bold definitions
        const parts = section.split('**');
        return (
          <div key={index} className="mb-4">
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <span key={i} className="font-semibold text-primary">{part}</span>
              ) : (
                <span key={i} className="text-secondary">{part}</span>
              )
            )}
          </div>
        );
      }
      if (section.startsWith('- ')) {
        // Handle bullet lists
        const items = section.split('\n');
        return (
          <ul key={index} className="list-disc pl-6 mb-4 space-y-2">
            {items.map((item, i) => (
              <li key={i} className="text-secondary">
                {item.substring(2)}
              </li>
            ))}
          </ul>
        );
      }
      if (section.match(/^\d+\./)) {
        // Handle numbered lists
        const items = section.split('\n');
        return (
          <ol key={index} className="list-decimal pl-6 mb-4 space-y-2">
            {items.map((item, i) => (
              <li key={i} className="text-secondary">
                {item.substring(item.indexOf('.') + 2)}
              </li>
            ))}
          </ol>
        );
      }
      
      return (
        <p key={index} className="mb-4 text-secondary leading-relaxed">
          {section}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Blog */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center space-x-4 text-sm text-secondary mb-4">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
            <span>by {post.author}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            {post.title}
          </h1>

          <p className="text-xl text-secondary leading-relaxed mb-6">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TagIcon className="h-4 w-4 text-secondary" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button className="flex items-center space-x-2 text-sm text-secondary hover:text-primary transition-colors">
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-secondary leading-relaxed">
            {renderContent(post.content)}
          </div>
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">
                Written by <span className="font-semibold text-primary">{post.author}</span>
              </p>
              <p className="text-xs text-secondary mt-1">
                Published on {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-sm text-secondary hover:text-primary transition-colors">
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </footer>

        {/* Related Posts Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">More Articles</h3>
              <Link
                href="/blog"
                className="text-secondary hover:text-primary transition-colors"
              >
                View all posts →
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
} 
'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarIcon, ClockIcon, TagIcon, ArrowLeftIcon, ShareIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline';
import Header from '../../../components/Header';
import { notFound } from 'next/navigation';
import CorruptCasinoSimulator from '../../components/tools/CorruptCasinoSimulator';

// This would typically come from a CMS, database, or markdown files
const blogPosts = [
  {
    id: 'mirage-of-obvious-games',
    title: 'The Mirage of Obvious Games: How Hidden Edges Define Success',
    excerpt: 'In trading, the most dangerous traps aren\'t the obvious ones—they\'re the subtle, hidden edges that slowly erode capital while appearing profitable. Learn how to identify and avoid these insidious wealth destroyers through interactive simulation.',
    content: `## The Dangerous Allure of the "Almost Fair" Game

Picture this: You're offered two games at a casino. Game A gives you a 10% chance of winning—obviously terrible, you'd never play. Game B gives you a 49% chance of winning—almost fair, almost reasonable. Most people would avoid Game A entirely but might be tempted by Game B.

**Here's the trap:** Game B is far more dangerous to your wealth than Game A.

This isn't a casino story—it's the fundamental challenge every trader faces in financial markets. The most dangerous strategies aren't the obviously bad ones that lose money quickly. They're the subtly negative ones that can appear profitable for months or even years before revealing their true nature.

## Why "Almost Fair" Games Are Wealth Destroyers

In my years analyzing trading strategies and working with systematic approaches, I've seen this pattern repeatedly. Traders avoid the obvious losers but get seduced by strategies with small negative edges because:

### The Slow Bleed Effect
A 49% win rate doesn't *feel* like a losing game. You'll win roughly half the time, creating a false sense of security. But over time, that tiny 1% edge compounds against you relentlessly.

### Noise Masks the Signal
Random market fluctuations can hide a negative edge for extended periods. You might have a fantastic month or quarter, reinforcing the belief that your strategy works. Meanwhile, the hidden edge is quietly eroding your capital.

### Psychological Comfort
Winning almost half the time feels reasonable. It doesn't trigger the same alarm bells as a strategy that loses 90% of the time. This comfort is precisely what makes it dangerous.

## The Mathematics of Hidden Destruction

Let me illustrate with a simple example that mirrors real trading scenarios:

**Strategy A**: 90% chance of losing $100, 10% chance of winning $1000
- Expected value: (0.9 × -$100) + (0.1 × $1000) = $10 (positive edge)

**Strategy B**: 51% chance of losing $100, 49% chance of winning $100  
- Expected value: (0.51 × -$100) + (0.49 × $100) = -$2 (negative edge)

Strategy A *looks* terrible but actually has a positive expected value. Strategy B *feels* reasonable but will slowly but surely destroy your capital.

## Real-World Trading Applications

This principle applies across all forms of trading:

### Options Selling
Selling out-of-the-money options often feels like "collecting premium" from gamblers. High win rates (70-80%) create confidence. But when volatility spikes or markets gap, the losses can be catastrophic.

### High-Frequency Scalping
Many retail traders love scalping because it provides frequent small wins. The win rate might be 60-70%, but transaction costs, slippage, and occasional large losses can create a negative edge.

### Trend Following with Poor Risk Management
Following trends can work, but without proper position sizing and risk management, even a decent strategy can have a hidden negative edge due to friction and behavioral biases.

## Interactive Learning

To truly understand how hidden edges work, theoretical knowledge isn't enough. You need to experience the slow, insidious erosion of capital that can occur when noise masks a negative edge. This is where simulation becomes invaluable.

The interactive simulator below demonstrates exactly this phenomenon. You can choose between two "corrupt casino" games and see how they play out over time. Pay particular attention to how the 49% win rate game can appear deceptively profitable for extended periods before the hidden edge reveals itself.

## Key Insights for Traders

Through years of market analysis and strategy development, I've identified several critical insights:

### 1. Obvious Bad Strategies Are Easy to Avoid
Most traders won't touch a strategy that clearly loses money. The real challenge is identifying the subtle losers disguised as winners.

### 2. Hidden Edges Are Insidious
Small negative expectancies can persist undetected for long periods, especially when masked by favorable market conditions or random luck.

### 3. Noise Provides False Comfort
Random fluctuations in returns can hide underlying negative trends for months or years, creating dangerous overconfidence.

### 4. Rigorous Testing Is Essential
Only through extensive backtesting, forward testing, and statistical analysis can you uncover hidden edges before they damage your capital.

### 5. Multi-Order Thinking Prevents Traps
Looking beyond immediate results to understand the deeper mathematical structure of your strategies is crucial for long-term success.

## The Professional Approach to Edge Detection

After analyzing thousands of trading strategies, here's my systematic approach to identifying hidden edges:

### Statistical Significance Testing
Don't rely on short-term results. Test your strategies across multiple market conditions and time periods. A strategy that works for six months might fail over three years.

### Transaction Cost Analysis
Include every cost: commissions, spreads, slippage, financing charges, and taxes. Many seemingly profitable strategies become losers when all costs are properly accounted for.

### Risk-Adjusted Returns
High returns mean nothing if they come with disproportionate risk. Calculate Sharpe ratios, maximum drawdowns, and other risk metrics to understand the true risk-adjusted edge.

### Behavioral Bias Auditing
Account for your own behavioral biases. Are you cutting winners short and letting losers run? These behaviors can turn a positive-edge strategy into a negative one.

## The Path Forward: Building Sustainable Trading Systems

Before deploying any trading strategy with real capital, follow this rigorous validation process:

### 1. Extensive Simulation
Run thousands of trials under various market conditions. Don't just test during bull markets—see how your strategy performs during crashes, high volatility periods, and sideways markets.

### 2. Edge Case Stress Testing
Consider what happens during market stress: liquidity dries up, correlations break down, volatility spikes. Your strategy must be robust enough to survive these conditions.

### 3. Complete Cost Accounting
Include every possible friction: transaction costs, market impact, financing charges, taxes, and opportunity costs. Many strategies are profitable in theory but fail in practice due to ignored costs.

### 4. Assumption Validation
Question every assumption underlying your strategy. Market microstructure changes, regulations evolve, and participant behavior shifts. Your strategy must be adaptable.

### 5. Systematic Risk Management
Have clear, quantifiable rules for position sizing, stop losses, and portfolio heat. Even the best strategy can be destroyed by poor risk management.

## The Philosophical Dimension

Beyond the mathematics and mechanics lies a deeper truth: successful trading requires intellectual humility. The market is constantly teaching us that our intuitions can be wrong, our analyses incomplete, and our strategies vulnerable to hidden flaws.

The traders who survive and thrive are those who:
- **Respect the power of compound negative expectancy**
- **Remain paranoid about hidden edges**
- **Test rigorously before deploying capital**
- **Accept that seemingly profitable strategies might be slowly destroying wealth**

## Final Thoughts: The Vigilance Imperative

Remember: in trading, what appears obvious often isn't the real danger. It's the subtle, hidden edges that can slowly but surely erode your capital while you're busy celebrating small wins.

The key to long-term success isn't just finding positive-edge strategies—it's developing the discipline and analytical rigor to detect negative edges before they cause damage. The market is filled with mirages that look like oases but are actually quicksand.

Stay vigilant. Test thoroughly. Question everything. And never forget that the most dangerous game is often the one that feels almost fair.

*Want to dive deeper into systematic trading approaches and risk management? Follow my blog for weekly insights on navigating the complex world of financial markets with data-driven strategies.*`,
    author: 'Erick Perez',
    publishedAt: '2024-01-20',
    readTime: '12 min read',
    tags: ['Edge Detection', 'Risk Management', 'Trading Psychology', 'Monte Carlo'],
    featured: true,
    authorBio: 'Financial professional with deep expertise in systematic trading, options strategies, and quantitative analysis. Passionate about bridging the gap between theory and practice in financial markets.',
    views: '2,347',
    expertise: ['Systematic Trading', 'Risk Management', 'Options Strategies', 'Quantitative Analysis']
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

  const renderContent = (content: string) => {
    // Split content by sections and handle the simulator insertion
    const sections = content.split('## Interactive Learning');
    
    if (sections.length > 1) {
      // Insert the simulator between the "Interactive Learning" section
      const beforeSimulator = sections[0] + '## Interactive Learning' + 
        sections[1].split('## Key Insights for Traders')[0];
      const afterSimulator = '## Key Insights for Traders' + 
        (sections[1].split('## Key Insights for Traders')[1] || '');
      
      return (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(beforeSimulator) }} />
          
          {/* Interactive Simulator Section */}
          <div className="my-12 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                Interactive Simulation Lab
              </h3>
              <p className="text-blue-700 dark:text-blue-200 text-lg">
                Experience the hidden edge phenomenon firsthand
              </p>
            </div>
            <CorruptCasinoSimulator />
          </div>
          
          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(afterSimulator) }} />
        </div>
      );
    }
    
    return (
      <div 
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
      />
    );
  };

  const formatMarkdown = (text: string): string => {
    return text
      // Headers with better styling
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-bold mt-10 mb-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mt-12 mb-8 text-gray-900 dark:text-gray-100">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mt-10 mb-6 text-gray-900 dark:text-gray-100">$1</h1>')
      
      // Bold and italic with better styling
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
      
      // Enhanced lists
      .replace(/^- (.*$)/gm, '<li class="mb-3 text-gray-700 dark:text-gray-300">$1</li>')
      .replace(/(<li.*<\/li>)/g, '<ul class="list-disc pl-6 mb-6 space-y-2">$1</ul>')
      .replace(/^\d+\. (.*$)/gm, '<li class="mb-3 text-gray-700 dark:text-gray-300">$1</li>')
      
      // Better paragraph styling
      .replace(/\n\n/g, '</p><p class="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">')
      .replace(/^(?!<[h|u|l])/gm, '<p class="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">')
      .replace(/$/gm, '</p>')
      
      // Clean up extra paragraph tags
      .replace(/<p class="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed"><\/p>/g, '')
      .replace(/<p class="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">(<[h|u])/g, '$1')
      .replace(/(<\/[h|u|l][^>]*>)<\/p>/g, '$1');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center space-x-2 text-blue-100 hover:text-white transition-colors group"
            >
              <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Blog</span>
            </Link>
          </div>

          {/* Article Meta */}
          <div className="flex items-center space-x-6 text-sm text-blue-100 mb-6">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <EyeIcon className="h-4 w-4" />
              <span>{post.views} views</span>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          {/* Excerpt */}
          <p className="text-xl text-blue-100 leading-relaxed mb-8 max-w-3xl">
            {post.excerpt}
          </p>
          
          {/* Tags */}
          <div className="flex items-center space-x-2 mb-8">
            <TagIcon className="h-4 w-4 text-blue-200" />
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
          {renderContent(post.content)}
        </div>

        {/* Author Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {post.author}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {post.authorBio}
              </p>
              
              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              
              {/* Social/Action Buttons */}
              <div className="flex items-center space-x-4">
                <Link
                  href="/blog"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  More Articles →
                </Link>
                <Link
                  href="/trading-tools"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Trading Tools →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Share Section */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Found this valuable? Share it with your network
            </h3>
            <div className="flex items-center justify-center space-x-6">
              <Link
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Twitter</span>
              </Link>
              <Link
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
              >
                <ShareIcon className="h-4 w-4" />
                <span>LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div className="mt-12 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Want to Master Risk Management?
          </h3>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            Explore our interactive trading tools and discover how to identify hidden edges in your strategies before they cost you money.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/trading-tools"
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Explore Trading Tools
            </Link>
            <Link
              href="/blog"
              className="px-6 py-3 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Read More Articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
} 
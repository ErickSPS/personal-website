'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarIcon, ClockIcon, TagIcon, ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import Header from '../../../components/Header';
import { notFound } from 'next/navigation';
import CorruptCasinoSimulator from '../../components/tools/CorruptCasinoSimulator';

// This would typically come from a CMS, database, or markdown files
const blogPosts = [
  {
    id: 'mirage-of-obvious-games',
    title: 'The Mirage of Obvious Games: How Hidden Edges Define Success',
    excerpt: 'Explore how small hidden negative edges can be more dangerous than obvious bad deals. Interactive simulator demonstrates how noise can mask true expectancy in trading strategies.',
    content: `In the complex world of trading and investing, we often fall prey to what I call "the mirage of obvious games." These are situations where a small, hidden negative edge can be far more dangerous than an obviously bad deal. While most traders would immediately reject a strategy that loses money 90% of the time, they might unknowingly embrace one that wins 49% of the time—not realizing that the slight negative edge can be just as devastating, if not more so, because it hides behind the noise of seemingly reasonable performance.

## The Paradox of Hidden Edges

Consider two coin-flipping games:

1. **Game A**: A coin that wins 10% of the time
2. **Game B**: A coin that wins 49% of the time

Most rational people would immediately reject Game A—the negative edge is obvious and brutal. But Game B? That feels almost fair. It's close to 50/50, and in the short term, you might even experience winning streaks that make it seem profitable.

This is the essence of hidden edges in trading. Small negative expectancies can persist for extended periods without detection, lulling traders into a false sense of security while slowly but surely eroding their capital.

## The Noise Factor

What makes hidden edges particularly dangerous is how they interact with market noise. In financial markets, random fluctuations can mask underlying trends for surprisingly long periods. A trading strategy with a small negative edge might show profits for weeks or even months, especially if the trader gets lucky with timing or market conditions.

This creates a dangerous feedback loop:
- **Initial Success**: Early profits reinforce the belief that the strategy works
- **Noise Masking**: Random market movements hide the negative edge
- **Overconfidence**: Success breeds larger position sizes and more risk-taking
- **Inevitable Ruin**: The hidden edge eventually asserts itself, often catastrophically

## Multi-Order Thinking in Action

Successful traders employ what Charlie Munger calls "multi-order thinking"—considering not just the immediate effects of their actions, but the second, third, and nth-order consequences. When evaluating a trading strategy, this means asking:

- **First Order**: Does this strategy make money?
- **Second Order**: What are the risks that might not be immediately apparent?
- **Third Order**: How would this strategy perform under different market conditions?
- **Fourth Order**: What psychological biases might be affecting my judgment?

## The Importance of Rigorous Testing

The antidote to hidden edges is rigorous, systematic testing. This includes:

### Statistical Significance
- **Large Sample Sizes**: Test strategies over thousands of trades, not dozens
- **Out-of-Sample Testing**: Validate performance on unseen data
- **Multiple Time Periods**: Test across different market regimes

### Stress Testing
- **Volatility Shifts**: How does the strategy perform when volatility changes?
- **Slippage Sensitivity**: What happens when execution costs increase?
- **Tail Events**: How does the strategy handle extreme market moves?

### Path Dependency
- **Drawdown Analysis**: What's the maximum expected drawdown?
- **Sequence of Returns**: How does the order of wins and losses affect outcomes?
- **Time to Recovery**: How long might it take to recover from losses?

## Practical Applications

In real trading, hidden edges can manifest in various ways:

### Transaction Costs
A strategy might appear profitable before accounting for:
- Bid-ask spreads
- Commission fees
- Slippage on large orders
- Financing costs for leveraged positions

### Market Impact
- **Capacity Constraints**: Strategies that work with small amounts may fail with larger capital
- **Liquidity Considerations**: Success in liquid markets may not translate to illiquid ones
- **Crowding Effects**: Popular strategies often become less effective over time

### Behavioral Factors
- **Overconfidence**: Early success leading to increased risk-taking
- **Survivorship Bias**: Only seeing successful examples, not the failures
- **Hindsight Bias**: Believing past success was more predictable than it actually was

## Interactive Learning

To truly understand how hidden edges work, theoretical knowledge isn't enough. You need to experience the slow, insidious erosion of capital that can occur when noise masks a negative edge. This is where simulation becomes invaluable.

The interactive simulator below demonstrates exactly this phenomenon. You can choose between two "corrupt casino" games and see how they play out over time. Pay particular attention to how the 49% win rate game can appear deceptively profitable for extended periods before the hidden edge reveals itself.

## Key Takeaways

1. **Obvious Bad Deals Are Easy to Avoid**: Most traders won't touch a strategy that clearly loses money
2. **Hidden Edges Are Insidious**: Small negative expectancies can persist undetected for long periods
3. **Noise Provides False Comfort**: Random fluctuations can mask underlying negative trends
4. **Rigorous Testing Is Essential**: Proper statistical analysis can reveal hidden edges before they cause damage
5. **Multi-Order Thinking Prevents Traps**: Looking beyond immediate results helps identify potential problems

## The Path Forward

Before deploying any trading strategy with real capital:

1. **Simulate Extensively**: Run thousands of trials under various conditions
2. **Test Edge Cases**: Consider what happens during market stress
3. **Account for All Costs**: Include every fee, spread, and friction
4. **Validate Assumptions**: Question every assumption underlying your strategy
5. **Plan for Failure**: Have clear exit criteria and risk management rules

Remember: in trading, what appears obvious often isn't the real danger. It's the subtle, hidden edges that can slowly but surely erode your capital while you're busy celebrating small wins. The key to long-term success is developing the discipline to test thoroughly, think critically, and respect the power of compound negative expectancy—even when it's hiding behind the noise of seemingly successful trades.`,
    author: 'Erick Perez',
    publishedAt: '2024-01-20',
    readTime: '12 min read',
    tags: ['Edge', 'Risk Management', 'Psychology', 'Simulation'],
    featured: true
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
        sections[1].split('## Key Takeaways')[0];
      const afterSimulator = '## Key Takeaways' + 
        (sections[1].split('## Key Takeaways')[1] || '');
      
      return (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(beforeSimulator) }} />
          <div className="my-12">
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
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-10 mb-6">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Lists
      .replace(/^- (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/(<li.*<\/li>)/g, '<ul class="list-disc pl-6 mb-4">$1</ul>')
      .replace(/^\d+\. (.*$)/gm, '<li class="mb-2">$1</li>')
      
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|u|l])/gm, '<p class="mb-4">')
      .replace(/$/gm, '</p>')
      
      // Clean up extra paragraph tags
      .replace(/<p class="mb-4"><\/p>/g, '')
      .replace(/<p class="mb-4">(<[h|u])/g, '$1')
      .replace(/(<\/[h|u|l][^>]*>)<\/p>/g, '$1');
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Blog</span>
          </Link>
        </div>

        {/* Article Meta */}
        <header className="mb-8">
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
            <div className="flex items-center space-x-1">
              <span>By {post.author}</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {post.title}
          </h1>
          
          <p className="text-lg text-secondary leading-relaxed mb-6">
            {post.excerpt}
          </p>
          
          <div className="flex items-center space-x-2 mb-6">
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
        </header>

        {/* Article Content */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          {renderContent(post.content)}
        </div>

        {/* Share Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShareIcon className="h-5 w-5 text-secondary" />
              <span className="text-secondary">Share this article</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Twitter
              </Link>
              <Link
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
} 
'use client'

import React from 'react'
import Link from 'next/link'
import { 
  ChartBarIcon, 
  CogIcon, 
  DocumentChartBarIcon,
  ChartPieIcon,
  CommandLineIcon,
  CodeBracketIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import Header from '../components/Header'

interface SkillCard {
  title: string
  description: string
  icon: React.ElementType
}

const skills: SkillCard[] = [
  {
    title: 'Equity Analysis',
    description: 'Fundamental analysis, valuation models, and market research for equity investments',
    icon: ChartBarIcon,
  },
  {
    title: 'Options Trading',
    description: 'Implementing sophisticated options strategies with a focus on risk management and volatility dynamics',
    icon: ArrowTrendingUpIcon,
  },
  {
    title: 'Risk Management',
    description: 'Portfolio optimization, VaR analysis, and risk metrics',
    icon: PresentationChartLineIcon,
  },
  {
    title: 'Technical Analysis',
    description: 'Price action, indicators, and chart pattern analysis',
    icon: ChartPieIcon,
  },
  {
    title: 'Systematic Trading',
    description: 'Algorithmic trading strategies and backtesting frameworks',
    icon: CogIcon,
  },
  {
    title: 'Market Research',
    description: 'Market analysis, sector studies, and economic research',
    icon: MagnifyingGlassIcon,
  },
  {
    title: 'Python Analytics',
    description: 'Data analysis, ML models, and financial computations',
    icon: CommandLineIcon,
  },
  {
    title: 'VBA Development',
    description: 'Excel automation and custom trading tools',
    icon: CodeBracketIcon,
  },
  {
    title: 'Data Analysis',
    description: 'Statistical analysis and data visualization',
    icon: DocumentChartBarIcon,
  },
]

const featuredWork = [
  {
    title: 'Volatility Analysis Tool',
    description: 'Data-driven options strategy recommendations powered by volatility analysis and market insights',
    icon: ChartBarIcon,
    link: '/trading-tools/volatility-forecast',
  },
  {
    title: 'Trading & Finance Blog',
    description: 'In-depth articles on trading strategies, market analysis, and quantitative finance techniques.',
    icon: PencilSquareIcon,
    link: '/blog',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background dark:from-slate-800/50 dark:to-background-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Financial Professional
              <br />
              <span className="text-gradient">Who Builds Data-Driven Trading Solutions</span>
            </h1>
            <p className="text-xl text-text dark:text-text-dark max-w-2xl mx-auto mb-8">
              Bridging the gap between financial markets and investment opportunities with
              practical tools and analysis
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link
                href="/trading-tools"
                className="hero-button-primary group w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  View Trading Tools
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/blog"
                className="hero-button-outline group w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <PencilSquareIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Read Blog
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <a
                href="#featured"
                className="hero-button-outline group w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <DocumentChartBarIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Featured Work
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section id="featured" className="py-20 bg-secondary/5 dark:bg-secondary-dark/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Work
            </h2>
            <p className="text-lg text-text dark:text-text-dark max-w-2xl mx-auto">
              Professional-grade tools and analysis for financial markets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredWork.map((work) => {
              const Icon = work.icon
              return (
                <Link
                  key={work.title}
                  href={work.link}
                  className="card card-hover group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-6 w-6 text-secondary dark:text-secondary-light" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-secondary dark:group-hover:text-secondary-light transition-colors">
                        {work.title}
                      </h3>
                      <p className="text-text dark:text-text-dark text-sm leading-relaxed">
                        {work.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Skills & Experience
            </h2>
            <p className="text-lg text-text dark:text-text-dark max-w-2xl mx-auto">
              A comprehensive set of financial and technical capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => {
              const Icon = skill.icon
              return (
                <div 
                  key={skill.title}
                  className="card card-hover group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-6 w-6 text-accent dark:text-accent-light" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
                        {skill.title}
                      </h3>
                      <p className="text-text dark:text-text-dark text-sm leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
} 
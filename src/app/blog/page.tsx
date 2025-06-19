'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import Header from '../../components/Header';

// This would typically come from a CMS, database, or markdown files
const blogPosts = [
  {
    id: 'mirage-of-obvious-games',
    title: 'The Mirage of Obvious Games: How Hidden Edges Define Success',
    excerpt: 'Explore how small hidden negative edges can be more dangerous than obvious bad deals. Interactive simulator demonstrates how noise can mask true expectancy in trading strategies.',
    content: '',
    author: 'Erick Perez', 
    publishedAt: '2024-12-15',
    readTime: '12 min read',
    tags: ['Edge', 'Risk Management', 'Psychology', 'Simulation'],
    featured: true
  }
];

export default function Blog() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background dark:from-primary-light/5 dark:to-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Trading & Finance Blog
            </h1>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Insights, strategies, and analysis from the world of quantitative finance and algorithmic trading
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12 bg-secondary/5 dark:bg-secondary-dark/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary">Featured Posts</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="card card-hover group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-sm text-secondary">
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
                    </div>
                    
                    <h3 className="text-xl font-semibold text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-secondary leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <TagIcon className="h-4 w-4 text-secondary" />
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary">All Posts</h2>
          </div>
          
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="block card card-hover group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-secondary">
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
                      {post.featured && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-secondary text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:ml-6">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 
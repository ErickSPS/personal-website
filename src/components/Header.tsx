'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from './providers/ThemeProvider';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border dark:border-border-dark bg-background/80 dark:bg-background-dark/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-14 flex items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary dark:text-primary-light">EP</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light transition-colors"
            >
              Home
            </Link>
            <Link
              href="/trading-tools"
              className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light transition-colors"
            >
              Trading Tools
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light transition-colors"
            >
              Blog
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <SunIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <MoonIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 
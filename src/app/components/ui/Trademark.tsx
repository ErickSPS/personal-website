import React from 'react';

interface TrademarkProps {
  variant?: 'subtle' | 'corner' | 'footer';
  className?: string;
}

export default function Trademark({ variant = 'subtle', className = '' }: TrademarkProps) {
  const baseClasses = "text-xs text-gray-400 dark:text-gray-500 font-mono";
  
  switch (variant) {
    case 'corner':
      return (
        <div className={`fixed bottom-4 right-4 ${baseClasses} ${className}`}>
          <span className="opacity-60 hover:opacity-100 transition-opacity">
            Vol Tools™ by EP
          </span>
        </div>
      );
    
    case 'footer':
      return (
        <div className={`flex justify-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 ${baseClasses} ${className}`}>
          <span className="opacity-60">
            Powered by <span className="font-semibold text-primary dark:text-primary-light">VolTools™</span> · EP Analytics
          </span>
        </div>
      );
    
    case 'subtle':
    default:
      return (
        <div className={`flex items-center justify-end ${baseClasses} ${className}`}>
          <span className="opacity-50 hover:opacity-75 transition-opacity">
            <span className="text-primary dark:text-primary-light font-semibold">EP</span>
            <span className="ml-1">VolTools™</span>
          </span>
        </div>
      );
  }
} 
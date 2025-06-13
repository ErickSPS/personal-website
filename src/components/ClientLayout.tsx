'use client';

import React from 'react';
import Header from './Header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main>{children}</main>
    </div>
  );
} 
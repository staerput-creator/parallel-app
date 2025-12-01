'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Динамически загружаем книгу ТОЛЬКО на клиенте
const BookReader = dynamic(() => import('@/components/BookReader'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-[#1a1a1a] flex items-center justify-center text-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-1 w-24 bg-red-600 mb-4 rounded-full"></div>
        <div className="font-mono uppercase tracking-widest text-xs">Loading Archives...</div>
      </div>
    </div>
  ),
});

export default function BookWrapper({ chapter }: { chapter: any }) {
  return <BookReader chapter={chapter} />;
}
'use client';

import dynamic from 'next/dynamic';

// Вот здесь мы динамически загружаем твою книгу и отключаем SSR
const BookReader = dynamic(() => import('./BookReader'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-[#1a1a1a] flex items-center justify-center text-white">
      <div className="animate-pulse">Загрузка страниц...</div>
    </div>
  ),
});

export default function BookLauncher({ chapter }: { chapter: any }) {
  return <BookReader chapter={chapter} />;
}
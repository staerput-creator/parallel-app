import { client } from '@/sanity/client';
import BookLauncher from '@/components/BookLauncher';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Загружаем данные на сервере
  const chapter = await client.fetch(`
    *[_type == "chapter" && slug.current == $slug][0] {
      title,
      "coverUrl": cover.asset->url,
      pages[] {
        content,
        "imageUrl": image.asset->url,
        "soundUrl": soundEffect.asset->url
      }
    }
  `, { slug });

  // 2. Обработка ошибки 404
  if (!chapter) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center font-mono">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
          <p className="mb-8">Глава &quot;{slug}&quot; не найдена в архивах.</p>
          <Link href="/" className="text-gray-500 hover:text-white flex items-center justify-center gap-2 transition-colors">
             <ArrowLeft className="w-4 h-4" /> Вернуться назад
          </Link>
        </div>
      </div>
    );
  }

  // 3. Рендер книги + Кнопка выхода
  return (
    <div className="bg-[#1a1a1a] min-h-screen overflow-hidden relative">
      
      {/* КНОПКА "НАЗАД" (Поверх книги) */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-3 text-white/30 hover:text-white transition-all duration-300 font-mono text-xs uppercase tracking-widest group"
      >
        <div className="p-2 border border-white/10 rounded-full group-hover:border-white/50 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </div>
        <span>Return to Base</span>
      </Link>

      <BookLauncher chapter={chapter} />
    </div>
  );
}
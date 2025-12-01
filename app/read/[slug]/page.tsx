import { client } from '@/sanity/client';
import BookWrapper from '@/components/BookWrapper';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Запрашиваем главу + ОБЛОЖКУ (coverUrl)
  const chapter = await client.fetch(`
    *[_type == "chapter" && slug.current == $slug][0] {
      _id,
      title,
      accessCode,
      "coverUrl": cover.asset->url, 
      pages[] {
        content,
        "imageUrl": image.asset->url,
        "soundUrl": soundEffect.asset->url
      }
    }
  `, { slug });

  if (!chapter) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center p-8 border border-red-900/50 rounded-lg bg-red-900/10">
          <h1 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-widest">Ошибка доступа</h1>
          <p className="text-gray-400 font-mono text-xs">Архив "{slug}" не найден или поврежден.</p>
          <Link href="/" className="mt-6 inline-flex items-center text-white hover:text-red-400 transition-colors text-sm font-bold">
             <ArrowLeft className="w-4 h-4 mr-2" /> Вернуться на базу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] min-h-screen overflow-hidden relative">
      
      {/* КНОПКА ВОЗВРАТА НА ГЛАВНУЮ */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase font-mono text-xs tracking-widest bg-black/20 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hub
      </Link>

      {/* Передаем данные в безопасную обертку */}
      <BookWrapper chapter={chapter} />
    </div>
  );
}
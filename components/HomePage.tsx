'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Cpu, FileText, BookOpen, User, Menu, Edit, ExternalLink, Lock, ArrowLeft, 
  MessageSquare, BarChart3, Play, KeyRound, Youtube 
} from 'lucide-react';
import { PortableText } from '@portabletext/react'; 
import imageUrlBuilder from '@sanity/image-url'; 
import { client } from '@/sanity/client'; 
import Giscus from '@giscus/react'; 
import Link from 'next/link';

const builder = imageUrlBuilder(client);
function urlFor(source: any) { return builder.image(source); }
const getEmbedUrl = (url: string) => { try { return `https://strawpoll.com/embed/${url.split('/').pop()}`; } catch { return ''; } };

// --- ПАРСЕРЫ ВИДЕО ---
const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getRutubeId = (url: string) => {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 1] || parts[parts.length - 2];
};

const getVkEmbedUrl = (url: string) => {
  if (!url) return null;
  try {
    // Ловим ID из ссылки вида vk.com/video-123_456
    const match = url.match(/video(-?\d+)_(\d+)/);
    if (match) {
      return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&hd=2`;
    }
    return null;
  } catch { return null; }
};

type CategoryId = 'all' | 'devblog' | 'lore' | 'premium';
const categories = [
  { id: 'all', label: 'Сводка', icon: Activity },
  { id: 'devblog', label: 'Девблог', icon: Cpu },
  { id: 'lore', label: 'Архивы', icon: FileText },
  { id: 'premium', label: 'Книга', icon: BookOpen },
] as const;

// --- КОМПОНЕНТЫ (С ОТЛАДКОЙ) ---
const ptComponents = {
  types: {
    image: ({ value }: any) => { 
      if (!value?.asset?._ref) return null; 
      return (
        <figure className="my-8 group">
          <img src={urlFor(value).width(1200).fit('max').auto('format').url()} alt={value.alt || 'Image'} className="rounded-lg shadow-2xl border border-white/10 w-full h-auto group-hover:border-white/30 transition-colors" />
          {value.caption && <figcaption className="text-center text-xs text-white/40 mt-2 font-mono uppercase tracking-widest">// {value.caption}</figcaption>}
        </figure>
      ); 
    },
    strawpoll: ({ value }: any) => { 
      if (!value?.url) return null; 
      return (<div className="my-10 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl"><div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400"><BarChart3 className="w-4 h-4" /> Голосование</div><iframe src={getEmbedUrl(value.url)} className="w-full h-[450px] border-none" title="Poll"></iframe></div>); 
    },
    splitImage: ({ value }: any) => { 
      if (!value?.image?.asset?._ref) return null; 
      const layout = value.layout || 'left-half'; 
      const isRight = layout.includes('right'); 
      const isSmall = layout.includes('third'); 
      const imageWidthClass = isSmall ? 'lg:w-1/3' : 'lg:w-1/2'; 
      return (<div className={`my-12 flex flex-col lg:flex-row gap-8 items-start ${isRight ? 'lg:flex-row-reverse' : ''}`}><div className={`w-full ${imageWidthClass} flex-shrink-0`}><img src={urlFor(value.image).width(800).url()} alt="Split" className="rounded-lg shadow-xl border border-white/10 w-full h-auto object-cover" /></div><div className="flex-1 min-w-0"><PortableText value={value.text} /></div></div>); 
    },
    
    // --- ПЛЕЕРЫ ---
    youtube: ({ value }: any) => {
      const id = getYoutubeId(value.url);
      if (!id) return <div className="p-4 border border-red-500 bg-red-900/10 text-red-500 text-xs font-mono">⚠️ Ошибка ссылки YouTube: {value.url}</div>;
      return (
        <div className="my-10 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video relative z-10">
           <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${id}`} title="YouTube" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
      );
    },
    rutube: ({ value }: any) => {
      const id = getRutubeId(value.url);
      if (!id) return <div className="p-4 border border-red-500 bg-red-900/10 text-red-500 text-xs font-mono">⚠️ Ошибка ссылки RuTube: {value.url}</div>;
      return (
        <div className="my-10 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video relative z-10">
           <iframe width="100%" height="100%" src={`https://rutube.ru/play/embed/${id}`} frameBorder="0" allow="clipboard-write; autoplay" allowFullScreen></iframe>
        </div>
      );
    },
    vkvideo: ({ value }: any) => {
      const embedUrl = getVkEmbedUrl(value.url);
      if (!embedUrl) return <div className="p-4 border border-red-500 bg-red-900/10 text-red-500 text-xs font-mono">⚠️ Ошибка VK (нужен формат видео-XXX_YYY): {value.url}</div>;
      return (
        <div className="my-10 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video relative z-10">
           <iframe src={embedUrl} width="100%" height="100%" allow="autoplay; encrypted-media; fullscreen; picture-in-picture;" frameBorder="0" allowFullScreen></iframe>
        </div>
      );
    },
  },
  // --- ВАЖНО: ЕСЛИ БЛОК НЕ РАСПОЗНАН, ПОКАЖЕМ ЭТО ---
  unknownType: ({ value }: any) => {
    return (
      <div className="my-4 p-4 border-2 border-yellow-500 bg-yellow-500/20 text-yellow-200 font-mono text-sm rounded">
        🛑 <strong>НЕИЗВЕСТНЫЙ БЛОК:</strong> {value._type}
        <br/>
        <span className="opacity-50 text-xs">Добавь "{value._type}" в ptComponents файла HomePage.tsx</span>
      </div>
    )
  }
};

export default function HomePage({ initialPosts, initialChapters }: { initialPosts: any[], initialChapters: any[] }) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [posts, setPosts] = useState(initialPosts);
  const [chapters, setChapters] = useState(initialChapters);

  useEffect(() => { setPosts(initialPosts); }, [initialPosts]);
  useEffect(() => { setChapters(initialChapters); }, [initialChapters]);

  const activePost = activePostId ? posts.find(p => p._id === activePostId) : null;
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  const getBgImage = () => {
    switch(activeCategory) {
      case 'devblog': return 'linear-gradient(to right, #06b6d405 1px, transparent 1px), linear-gradient(to bottom, #06b6d405 1px, transparent 1px)';
      case 'premium': return 'radial-gradient(circle at bottom right, #e11d4820 0%, transparent 60%)';
      case 'lore': return 'radial-gradient(circle at center, #ffffff05 0%, transparent 70%)';
      default: return 'none';
    }
  };

  const BOOSTY_LINK = "https://boosty.to/parallel-game";

  return (
    <div className="flex h-screen overflow-hidden font-sans text-white bg-[#0a0a0a]" style={{ backgroundImage: getBgImage() }}>
      
      {/* SIDEBAR */}
      <aside className="fixed bottom-0 w-full md:relative md:w-72 md:h-full z-50 flex md:flex-col justify-between bg-[#111111] border-r border-[#222]">
        <div className="hidden md:flex flex-col p-8 border-b border-[#222]">
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase leading-none text-white">ПАРАЛЛЕЛЬ v2.0</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-2 opacity-50">SYSTEM ONLINE</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2 md:py-8 flex md:flex-col justify-around md:justify-start w-full md:space-y-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id && activePostId === null;
            return (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.id as CategoryId); setActivePostId(null); }}
                className={`flex items-center px-6 py-3 rounded transition-all ${isActive ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                <Icon className="w-5 h-5 mr-3" /> <span className="text-sm font-bold uppercase tracking-wider">{cat.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="hidden md:block p-6 border-t border-[#222] text-xs text-gray-500">ID: ADMIN</div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-12 relative">
        
        {activePost ? (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => setActivePostId(null)} className="flex items-center gap-2 text-xs font-mono uppercase opacity-50 hover:opacity-100"><ArrowLeft className="w-4 h-4" /> Return</button>
                <a href={`/studio/structure/post;${activePost._id}`} target="_blank" className="opacity-30 hover:opacity-100 transition-opacity"><Edit className="w-4 h-4"/></a>
            </div>
            
            {activePost.isPremium ? (
               <div className="p-10 border border-red-900/50 rounded-xl text-center bg-red-900/10">
                 <Lock className="w-10 h-10 mx-auto mb-4 text-red-500" />
                 <h2 className="text-2xl font-bold mb-2">Restricted Access</h2>
                 <a href={BOOSTY_LINK} target="_blank" className="inline-block mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors">Subscribe to Read</a>
               </div>
            ) : (
               <article>
                 <header className="mb-10 pb-8 border-b border-white/10">
                   <h1 className="text-4xl font-bold mb-4">{activePost.title}</h1>
                   <div className="text-xs font-mono opacity-50 flex gap-4"><span>{formatDate(activePost.publishedAt)}</span></div>
                 </header>
                 <div className="prose prose-invert max-w-none prose-img:rounded-xl">
                   {/* ВАЖНО: передаем ptComponents */}
                   <PortableText value={activePost.content} components={ptComponents} />
                 </div>
                 {activePost.allowComments && (
                    <div className="mt-16 pt-10 border-t border-white/10">
                        <Giscus id="comments" repo="staerput-creator/parallel-app" repoId="R_kgDONR2d_A" category="Announcements" categoryId="DIC_kwDONR2d_M4Ckce_" mapping="pathname" term="Welcome" reactionsEnabled="1" emitMetadata="0" inputPosition="top" theme="transparent_dark" lang="ru" loading="lazy" />
                    </div>
                 )}
               </article>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-4xl font-bold mb-8 uppercase tracking-tighter flex items-center gap-3">
              {categories.find(c => c.id === activeCategory)?.label}
              {activeCategory === 'premium' && <span className="text-xs bg-red-600 px-2 py-1 rounded text-white font-mono">LIVE FEED</span>}
            </h2>

            {/* --- СЕКЦИЯ КНИГИ --- */}
            {activeCategory === 'premium' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                 {chapters.length === 0 && <div className="col-span-full opacity-50 font-mono">NO CHAPTERS FOUND</div>}
                 
                 {chapters.map((chapter) => {
                   const isFree = chapter.chapterNumber <= 2;
                   
                   // ФИКС: Ссылка ведет на страницу чтения
                   const linkUrl = `/read/${chapter.slug.current}`;

                   return (
                     <Link href={linkUrl} key={chapter._id}
                       className="group relative bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-red-500/50 transition-all hover:-translate-y-1 h-[400px] flex flex-col">
                       
                       <div className="h-2/3 bg-[#222] relative overflow-hidden">
                         {chapter.coverUrl ? (
                           <img src={chapter.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-red-900/20 group-hover:bg-red-900/30 transition-colors">
                             <BookOpen className="w-12 h-12 text-red-500 opacity-50" />
                           </div>
                         )}
                         <div className="absolute top-4 right-4">
                           {!isFree ? (
                             <div className="bg-black/80 backdrop-blur text-yellow-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-yellow-500/30">
                               <Lock className="w-3 h-3" /> PREMIUM
                             </div>
                           ) : (
                             <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">FREE</div>
                           )}
                         </div>
                       </div>

                       <div className="p-6 flex-1 flex flex-col">
                         <div className="text-xs font-mono text-gray-500 mb-2">CHAPTER {chapter.chapterNumber.toString().padStart(2, '0')}</div>
                         <h3 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors line-clamp-2">{chapter.title}</h3>
                         
                         <div className="mt-auto flex items-center text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                           {isFree ? (
                             <><Play className="w-4 h-4 mr-2 fill-current" /> ЧИТАТЬ</>
                           ) : (
                             // КНОПКА "ВВЕСТИ КОД"
                             <><KeyRound className="w-4 h-4 mr-2" /> ВВЕСТИ КОД</>
                           )}
                         </div>
                       </div>
                     </Link>
                   )
                 })}
               </div>
            ) : (
              // --- СЕТКА ПОСТОВ ---
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.filter(p => activeCategory === 'all' || p.category === activeCategory).map((post) => (
                  <article key={post._id} onClick={() => setActivePostId(post._id)} 
                    className="bg-[#111] border border-[#222] p-6 rounded-xl hover:border-white/30 transition-all cursor-pointer group h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-mono border border-white/20 px-2 py-1 rounded text-white/60">{post.label || 'FILE'}</span>
                      {post.isPremium && <Lock className="w-3 h-3 text-red-500" />}
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">{post.title}</h3>
                    <div className="mt-auto pt-4 border-t border-white/5 text-[10px] font-mono opacity-50 flex justify-between">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>{">>>"}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
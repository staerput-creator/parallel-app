'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Cpu, FileText, BookOpen, User, Menu, Lock, ArrowLeft, 
  MessageSquare, Edit, ExternalLink, BarChart3 
} from 'lucide-react';
import { client } from '@/sanity/client'; 
import { PortableText } from '@portabletext/react'; 
import imageUrlBuilder from '@sanity/image-url'; 
import Giscus from '@giscus/react'; 

// --- Image Builder ---
const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

// --- Helper: Polls ---
const getEmbedUrl = (url: string) => {
  try {
    if (!url) return '';
    const pollId = url.split('/').pop();
    return `https://strawpoll.com/embed/${pollId}`;
  } catch (e) { return ''; }
};

// --- Types ---
type CategoryId = 'all' | 'devblog' | 'lore' | 'premium';

interface Post {
  _id: string;
  title: string;
  category: CategoryId;
  label: string;
  publishedAt: string;
  isPremium: boolean;
  allowComments: boolean;
  content: any;
}

interface ThemeConfig {
  className: string;
  subtitle: string;
  bgImage: string;
}

// --- Config ---
const categories: { id: CategoryId; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Сводка', icon: Activity },
  { id: 'devblog', label: 'Девблог', icon: Cpu },
  { id: 'lore', label: 'Архивы', icon: FileText },
  { id: 'premium', label: 'Книга', icon: BookOpen },
];

const themes: Record<CategoryId, ThemeConfig> = {
  all: { className: 'theme-neutral', subtitle: 'Общий обзор', bgImage: 'none' },
  devblog: { className: 'theme-devblog', subtitle: 'Dev Terminal', bgImage: 'linear-gradient(to right, #06b6d405 1px, transparent 1px), linear-gradient(to bottom, #06b6d405 1px, transparent 1px)' },
  lore: { className: 'theme-lore', subtitle: 'Archive Section', bgImage: 'radial-gradient(circle at center, #ffffff05 0%, transparent 70%)' },
  premium: { className: 'theme-premium', subtitle: 'Restricted Area', bgImage: 'radial-gradient(circle at bottom right, #e11d4815 0%, transparent 60%)' },
};

// --- PORTABLE TEXT COMPONENTS ---
const ptComponents = {
  types: {
    // 1. Обычная картинка (на всю ширину)
    image: ({ value }: any) => {
      if (!value?.asset?._ref) return null;
      return (
        <figure className="my-8 group">
          <img
            src={urlFor(value).width(1200).fit('max').auto('format').url()}
            alt={value.alt || 'Image'}
            className="rounded-lg shadow-2xl border border-white/10 w-full h-auto group-hover:border-white/30 transition-colors"
          />
          {value.caption && <figcaption className="text-center text-xs text-white/40 mt-2 font-mono uppercase tracking-widest">// {value.caption}</figcaption>}
        </figure>
      );
    },
    // 2. Опросы
    strawpoll: ({ value }: any) => {
      if (!value?.url) return null;
      return (
        <div className="my-10 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400">
            <BarChart3 className="w-4 h-4" /> Голосование
          </div>
          <iframe src={getEmbedUrl(value.url)} className="w-full h-[450px] border-none" title="Poll"></iframe>
        </div>
      );
    },
    // 3. НОВОЕ: Секция Фото + Текст
    splitImage: ({ value }: any) => {
      if (!value?.image?.asset?._ref) return null;
      
      // Определяем настройки макета
      const layout = value.layout || 'left-half';
      const isRight = layout.includes('right');
      const isSmall = layout.includes('third');
      
      // Классы ширины
      const imageWidthClass = isSmall ? 'lg:w-1/3' : 'lg:w-1/2';
      
      return (
        <div className={`my-12 flex flex-col lg:flex-row gap-8 items-start ${isRight ? 'lg:flex-row-reverse' : ''}`}>
          {/* Блок Картинки */}
          <div className={`w-full ${imageWidthClass} flex-shrink-0`}>
             <img
              src={urlFor(value.image).width(800).url()}
              alt="Split View"
              className="rounded-lg shadow-xl border border-white/10 w-full h-auto object-cover"
            />
          </div>
          
          {/* Блок Текста */}
          <div className="flex-1 min-w-0">
             {/* Рендерим вложенный текст рекурсивно */}
             <PortableText value={value.text} /> 
          </div>
        </div>
      );
    }
  }
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes.all);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = `*[_type == "post"] | order(publishedAt desc)`;
        const data = await client.fetch(query);
        setPosts(data);
      } catch (error) { console.error("Err:", error); } finally { setLoading(false); }
    };
    fetchPosts();
  }, []);

  useEffect(() => { setCurrentTheme(themes[activeCategory]); }, [activeCategory]);

  const activePost = activePostId ? posts.find(p => p._id === activePostId) : null;
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  
  const getThemeVariables = () => {
    switch (activeCategory) {
      case 'devblog': return { '--bg-main': '#020617', '--sidebar-bg': '#0f172a', '--accent-color': '#06b6d4', '--text-primary': '#f1f5f9', '--text-secondary': '#64748b', '--card-border': '#1e293b' } as React.CSSProperties;
      case 'premium': return { '--bg-main': '#000000', '--sidebar-bg': '#111111', '--accent-color': '#e11d48', '--text-primary': '#ffe4e6', '--text-secondary': '#9f1239', '--card-border': '#3f111b' } as React.CSSProperties;
      case 'lore': return { '--bg-main': '#0c0a09', '--sidebar-bg': '#1c1917', '--accent-color': '#a8a29e', '--text-primary': '#e7e5e4', '--text-secondary': '#78716c', '--card-border': '#292524' } as React.CSSProperties;
      default: return { '--bg-main': '#0a0a0a', '--sidebar-bg': '#111111', '--accent-color': '#d4d4d8', '--text-primary': '#ffffff', '--text-secondary': '#71717a', '--card-border': '#27272a' } as React.CSSProperties;
    }
  };

  if (loading) return <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center text-white font-mono"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div><p className="animate-pulse">SYSTEM BOOTING...</p></div>;

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-500" style={{ ...getThemeVariables(), backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <aside className="fixed bottom-0 w-full md:relative md:w-72 md:h-full z-50 flex md:flex-col justify-between shadow-2xl backdrop-blur-md border-t md:border-t-0 md:border-r transition-colors duration-500" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--card-border)' }}>
        <div className="hidden md:flex flex-col p-8 border-b relative overflow-hidden transition-colors duration-500" style={{ borderColor: 'var(--card-border)' }}>
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase leading-none text-white z-10">ПАРАЛЛЕЛЬ</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-2 opacity-70 transition-all duration-500" style={{ color: 'var(--accent-color)' }}>{currentTheme.subtitle}</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2 md:py-8 flex md:flex-col justify-around md:justify-start w-full md:space-y-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id && activePostId === null;
            return (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setActivePostId(null); }} className={`group flex flex-col md:flex-row items-center md:px-6 py-3 mx-2 md:mx-0 transition-all duration-300 rounded md:rounded-none ${isActive ? 'border-l-2 bg-white/5 shadow-lg' : 'hover:bg-white/5 border-l-2 border-transparent'}`} style={{ borderColor: isActive ? 'var(--accent-color)' : 'transparent', color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                <Icon className={`w-6 h-6 md:w-5 md:h-5 md:mr-4 mb-1 md:mb-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} /><span className="text-[10px] md:text-sm font-bold uppercase tracking-wider">{cat.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="hidden md:block p-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 opacity-60"><div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center"><User className="w-4 h-4 text-white" /></div><div className="text-xs"><p className="font-bold uppercase tracking-wide">GUEST</p><p className="text-xs opacity-50">Mode</p></div></div>
              <a href="/studio" target="_blank" className="p-2 hover:bg-white/10 rounded transition-colors opacity-50 hover:opacity-100 group relative" title="Admin"><Edit className="w-4 h-4 text-white" /></a>
           </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-700" style={{ backgroundImage: currentTheme.bgImage }}>
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b z-40" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--card-border)' }}><h1 className="font-extrabold text-white text-lg tracking-tight uppercase">ПАРАЛЛЕЛЬ</h1><button className="p-2 opacity-50 hover:opacity-100"><Menu className="w-6 h-6 text-white" /></button></header>
        <div className="flex-1 overflow-y-auto p-4 md:p-12 pb-24 md:pb-12 scroll-smooth z-10 relative">
          {activePost ? (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                 <button onClick={() => setActivePostId(null)} className="flex items-center gap-2 text-xs font-mono uppercase opacity-50 hover:opacity-100 transition-colors" style={{ color: 'var(--accent-color)' }}><ArrowLeft className="w-4 h-4" /> Return</button>
                 <a href={`/studio/structure/post;${activePost._id}`} target="_blank" className="flex items-center gap-2 text-xs font-mono uppercase opacity-30 hover:opacity-100 transition-colors"><span className="hidden md:inline">Edit</span><ExternalLink className="w-3 h-3" /></a>
              </div>
              {activePost.isPremium ? (
                <div className="max-w-2xl mx-auto pt-10 text-center">
                  <div className="inline-block p-6 rounded-full border-2 mb-8 bg-white/5" style={{ borderColor: 'var(--card-border)' }}><Lock className="w-10 h-10" style={{ color: 'var(--accent-color)' }} /></div>
                  <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-wider">Доступ Запрещен</h2>
                  <p className="text-sm font-mono opacity-60 mb-10 max-w-md mx-auto">Данные зашифрованы.</p>
                  <a href="https://boosty.to/YOUR_PAGE" target="_blank" rel="noopener noreferrer" className="inline-block border px-8 py-4 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--card-border)' }}>Купить Ключ</a>
                </div>
              ) : (
                <article className="relative">
                   <header className="mb-10 pb-8 border-b border-dashed" style={{ borderColor: 'var(--card-border)' }}><h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">{activePost.title}</h1><div className="flex gap-4 text-xs font-mono opacity-60"><span>{formatDate(activePost.publishedAt)}</span><span>CAT: {activePost.category?.toUpperCase() || 'GENERAL'}</span></div></header>
                   <div className="prose max-w-none prose-invert prose-p:leading-relaxed prose-headings:text-white prose-a:text-blue-400 prose-img:rounded-xl">
                      <PortableText value={activePost.content} components={ptComponents} />
                   </div>
                   {activePost.allowComments && (
                     <div className="mt-16 pt-10 border-t border-dashed" style={{ borderColor: 'var(--card-border)' }}>
                       <div className="flex items-center gap-2 mb-6 opacity-60"><MessageSquare className="w-4 h-4" /><span className="text-xs font-mono uppercase tracking-widest">Secure Comms Channel</span></div>
                       <Giscus id="comments" repo="staerput-creator/parallel-app" repoId="R_kgDONR2d_A" category="Announcements" categoryId="DIC_kwDONR2d_M4Ckce_" mapping="pathname" term="Welcome to Parallel" reactionsEnabled="1" emitMetadata="0" inputPosition="top" theme="transparent_dark" lang="ru" loading="lazy" />
                     </div>
                   )}
                </article>
              )}
            </div>
          ) : (
            <>
              <div className="mb-12 animate-in fade-in duration-500"><div className="flex items-center gap-2 mb-2"><span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-color)' }}></span><span className="text-xs font-mono opacity-70 uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>System Online</span></div><h2 className="text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tighter">{categories.find(c => c.id === activeCategory)?.label}</h2></div>
              {posts.filter(p => activeCategory === 'all' || p.category === activeCategory).length === 0 ? (
                  <div className="p-10 border border-dashed text-center opacity-50 font-mono text-sm" style={{ borderColor: 'var(--card-border)' }}>NO DATA FOUND</div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.filter(p => activeCategory === 'all' || p.category === activeCategory).map((post, idx) => (
                      <article key={post._id} onClick={() => setActivePostId(post._id)} className="relative flex flex-col h-full border opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer group overflow-hidden animate-in slide-in-from-bottom-4 fill-mode-forwards" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--card-border)', animationDelay: `${idx * 100}ms` }}>
                        <div className="p-6 flex flex-col h-full relative z-10"><div className="flex justify-between items-start mb-4"><span className="text-[9px] font-mono uppercase border px-2 py-1" style={{ borderColor: 'var(--card-border)', color: 'var(--accent-color)' }}>{post.label || 'INFO'}</span>{post.isPremium && <Lock className="w-3 h-3" style={{ color: 'var(--accent-color)' }} />}</div><h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{post.title}</h3><div className="mt-auto pt-4 border-t border-dashed flex justify-between items-center text-[10px] opacity-60 font-mono uppercase" style={{ borderColor: 'var(--card-border)' }}><span>{formatDate(post.publishedAt)}</span><span className="group-hover:translate-x-1 transition-transform">{">>>"}</span></div></div>
                      </article>
                    ))}
                  </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
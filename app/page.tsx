'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, Cpu, FileText, BookOpen, Menu, Lock, ArrowLeft, 
  MessageSquare, Edit, ExternalLink, BarChart3, Play, KeyRound, 
  X, Mail, Info, Languages, MessageCircle, Headphones, Volume2, Volume1, VolumeX,
  CheckCircle2, CircleDashed, Loader2, Calendar, Map as MapIcon
} from 'lucide-react'; 
import { client } from '@/sanity/client'; 
import { PortableText } from '@portabletext/react'; 
import imageUrlBuilder from '@sanity/image-url'; 
import Giscus from '@giscus/react'; 
import { useRouter } from 'next/navigation';

// --- ИМПОРТЫ ---
import { categories, themes, translations, CategoryId, Language, ThemeConfig } from '@/src/lib/siteData';
import { getEmbedUrl, getYoutubeId, getRutubeId, getVkEmbedUrl, formatDate } from '@/src/lib/utils';
// УБРАЛИ ИМПОРТ GameOverlay - ОН ТУТ БОЛЬШЕ НЕ НУЖЕН

const builder = imageUrlBuilder(client);
function urlFor(source: any) { return builder.image(source); }

// --- Types ---
interface Post {
  _id: string;
  title: string;
  category: CategoryId;
  label: string;
  publishedAt: string;
  isPremium: boolean;
  allowComments: boolean;
  content: any;
  language?: Language;
}

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  slug: { current: string };
  coverUrl: string;
  accessCode?: string;
  language?: Language;
}

interface RoadmapItem {
  _key: string;
  title: string;
  description?: string;
  status: 'done' | 'in-progress' | 'planned';
  x?: number;
  y?: number;
}

interface RoadmapDocument {
  title: string;
  mapImageUrl?: string;
  items: RoadmapItem[];
}

// --- KONAMI CODE SEQUENCE ---
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function Home() {
  const router = useRouter();
  
  // --- STATES ---
  const [lang, setLang] = useState<Language>('ru'); 
  const t = translations[lang];

  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes.all);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [roadmapData, setRoadmapData] = useState<RoadmapDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // --- AUDIO STATE ---
  const PLAYLIST = useMemo(() => [
    '/sounds/track1.mp3', 
    '/sounds/track2.mp3',
    '/sounds/track3.mp3',
  ], []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTrack, setCurrentTrack] = useState(PLAYLIST[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // УБРАЛИ STATE isGameOpen - ОН БОЛЬШЕ НЕ НУЖЕН

  // --- MODALS ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [authError, setAuthError] = useState('');

  const BOOSTY_LINK = "https://boosty.to/parallel-game";
  const VK_LINK = "https://vk.com/parallel_game";

  // --- AUDIO LOGIC ---
  const pickRandomTrack = () => {
    if (PLAYLIST.length <= 1) return PLAYLIST[0];
    let nextIndex;
    let nextTrack;
    do {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
      nextTrack = PLAYLIST[nextIndex];
    } while (nextTrack === currentTrack);
    return nextTrack;
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = volume; 
      audioRef.current.play().catch(e => console.log("Audio autoplay block", e));
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (!isPlaying && newVolume > 0 && audioRef.current) {
        audioRef.current.play().catch(e => {});
        setIsPlaying(true);
    }
  };

  const handleTrackEnded = () => {
    const nextTrack = pickRandomTrack();
    setCurrentTrack(nextTrack);
    setTimeout(() => {
        if(audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.play().catch(e => console.log("Auto-switch error", e));
        }
    }, 100);
  };

  // --- KONAMI CODE LISTENER (ПЕРЕХОД НА СЕКРЕТНУЮ СТРАНИЦУ) ---
  useEffect(() => {
    let cursor = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KONAMI_CODE[cursor]) {
        cursor++;
        if (cursor === KONAMI_CODE.length) {
          // 1. Выдаем "пропуск" (сохраняем в сессии браузера)
          sessionStorage.setItem('parallel_secret_access', 'granted');
          // 2. Редиректим на секретную страницу
          router.push('/secret');
          cursor = 0;
        }
      } else {
        cursor = 0;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // --- PORTABLE TEXT COMPONENTS ---
  const ptComponents = useMemo(() => ({
    types: {
      image: ({ value }: any) => {
        if (!value?.asset?._ref) return null;
        return (
          <figure className="my-8 group">
            <img
              src={urlFor(value).width(1200).fit('max').auto('format').url()}
              alt={value.alt || t.imageCaption}
              className="rounded-lg shadow-2xl border border-white/10 w-full h-auto group-hover:border-white/30 transition-colors"
            />
            {value.caption && <figcaption className="text-center text-xs text-white/40 mt-2 font-mono uppercase tracking-widest opacity-60">// {value.caption}</figcaption>}
          </figure>
        );
      },
      strawpoll: ({ value }: any) => {
        if (!value?.url) return null;
        return (
          <div className="my-10 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400">
              <BarChart3 className="w-4 h-4" /> {t.poll}
            </div>
            <iframe src={getEmbedUrl(value.url)} className="w-full h-[450px] border-none" title="Poll"></iframe>
          </div>
        );
      },
      splitImage: ({ value }: any) => {
        if (!value?.image?.asset?._ref) return null;
        const layout = value.layout || 'left-half';
        const isRight = layout.includes('right');
        const isSmall = layout.includes('third');
        const imageWidthClass = isSmall ? 'lg:w-1/3' : 'lg:w-1/2';
        return (
          <div className={`my-12 flex flex-col lg:flex-row gap-8 items-start ${isRight ? 'lg:flex-row-reverse' : ''}`}>
            <div className={`w-full ${imageWidthClass} flex-shrink-0`}>
               <img src={urlFor(value.image).width(800).url()} alt="Split View" className="rounded-lg shadow-xl border border-white/10 w-full h-auto object-cover" />
            </div>
            <div className="flex-1 min-w-0"><PortableText value={value.text} /></div>
          </div>
        );
      },
      youtube: ({ value }: any) => {
        const id = getYoutubeId(value.url);
        if (!id) return null;
        return (
          <div className="my-10 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video relative z-10">
             <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${id}`} title="YouTube" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        );
      },
      rutube: ({ value }: any) => {
        const id = getRutubeId(value.url);
        if (!id) return null;
        return (
          <div className="my-10 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video relative z-10">
             <iframe width="100%" height="100%" src={`https://rutube.ru/play/embed/${id}`} frameBorder="0" allow="clipboard-write; autoplay" allowFullScreen></iframe>
          </div>
        );
      },
      vkvideo: ({ value }: any) => {
        const embedUrl = getVkEmbedUrl(value.url);
        if (!embedUrl) return null;
        return (
          <div className="my-10 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video relative z-10">
             <iframe src={embedUrl} width="100%" height="100%" allow="autoplay; encrypted-media; fullscreen; picture-in-picture;" frameBorder="0" allowFullScreen></iframe>
          </div>
        );
      },
      unknownType: ({ value }: any) => <div className="text-yellow-500 text-xs">Unknown Block: {value._type}</div>
    }
  }), [t]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postsQuery = `*[_type == "post"] | order(publishedAt desc) { ..., language }`;
        const chaptersQuery = `*[_type == "chapter"] | order(chapterNumber asc) {
          _id, title, chapterNumber, slug, "coverUrl": cover.asset->url, accessCode, language
        }`;
        const roadmapQuery = `*[_type == "roadmap"][0]{
          title,
          "mapImageUrl": mapImage.asset->url,
          items[] {
            _key,
            title,
            description,
            status,
            x,
            y
          }
        }`;

        const [postsData, chaptersData, mapData] = await Promise.all([
          client.fetch(postsQuery),
          client.fetch(chaptersQuery),
          client.fetch(roadmapQuery)
        ]);

        setPosts(postsData);
        setChapters(chaptersData);
        setRoadmapData(mapData);
      } catch (error) { console.error("Err:", error); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => { setCurrentTheme(themes[activeCategory]); }, [activeCategory]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'ru' ? 'en' : 'ru');
    setActivePostId(null);
  };

  const filteredPosts = posts.filter(p => (p.language || 'ru') === lang);
  const filteredChapters = chapters.filter(c => (c.language || 'ru') === lang);

  const activePost = activePostId ? filteredPosts.find(p => p._id === activePostId) : null;
  
  const getThemeVariables = () => {
    switch (activeCategory) {
      case 'devblog': return { '--bg-main': '#020617', '--sidebar-bg': '#0f172a', '--accent-color': '#06b6d4', '--text-primary': '#f1f5f9', '--text-secondary': '#64748b', '--card-border': '#1e293b' } as React.CSSProperties;
      case 'premium': return { '--bg-main': '#000000', '--sidebar-bg': '#111111', '--accent-color': '#e11d48', '--text-primary': '#ffe4e6', '--text-secondary': '#9f1239', '--card-border': '#3f111b' } as React.CSSProperties;
      case 'lore': return { '--bg-main': '#0c0a09', '--sidebar-bg': '#1c1917', '--accent-color': '#a8a29e', '--text-primary': '#e7e5e4', '--text-secondary': '#78716c', '--card-border': '#292524' } as React.CSSProperties;
      case 'roadmap': return { '--bg-main': '#050505', '--sidebar-bg': '#0a0a0a', '--accent-color': '#10b981', '--text-primary': '#ecfdf5', '--text-secondary': '#6ee7b7', '--card-border': '#064e3b' } as React.CSSProperties;
      default: return { '--bg-main': '#0a0a0a', '--sidebar-bg': '#111111', '--accent-color': '#d4d4d8', '--text-primary': '#ffffff', '--text-secondary': '#71717a', '--card-border': '#27272a' } as React.CSSProperties;
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    const isLocked = !!chapter.accessCode;
    if (!isLocked) {
        router.push(`/read/${chapter.slug.current}`);
    } else {
        setSelectedChapter(chapter);
        setAccessCode('');
        setAuthError('');
        setIsAuthModalOpen(true);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapter || !selectedChapter.accessCode) return;
    if (accessCode.trim() === selectedChapter.accessCode) {
       setIsAuthModalOpen(false);
       router.push(`/read/${selectedChapter.slug.current}?token=${accessCode}`);
    } else {
       setAuthError(t.errorKey);
    }
  };

  if (loading) return <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center text-white font-mono"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div><p className="animate-pulse">{t.systemBooting}</p></div>;

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-all duration-700" style={{ ...getThemeVariables(), backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      
      <audio ref={audioRef} loop src={currentTrack} onEnded={handleTrackEnded} />

      {/* --- ИГРОВОЙ ОВЕРЛЕЙ УДАЛЕН ИЗ DOM СТРАНИЦЫ --- */}

      {/* --- MENU OVERLAY --- */}
      {isInfoMenuOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full md:w-[400px] h-full bg-[#0a0a0a] border-l border-white/10 shadow-2xl p-8 flex flex-col relative animate-in slide-in-from-right duration-300">
             <button onClick={() => setIsInfoMenuOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-white" />
             </button>

             <div className="mt-12 mb-8">
                <h2 className="text-3xl font-extrabold text-white uppercase tracking-tighter mb-2">{t.projectTitle}</h2>
                <div className="w-12 h-1 bg-red-600"></div>
             </div>

             <div className="space-y-8 flex-1 overflow-y-auto">
                <div>
                   <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">{t.contactsTitle}</h3>
                   <ul className="space-y-4">
                      <li>
                        <a href="mailto:contact@parallel.game" className="flex items-center gap-4 text-white hover:text-red-500 transition-colors group">
                           <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-red-500/50"><Mail className="w-4 h-4" /></div>
                           <span className="text-sm font-mono">{t.email}</span>
                        </a>
                      </li>
                      <li>
                        <a href={VK_LINK} target="_blank" className="flex items-center gap-4 text-white hover:text-blue-500 transition-colors group">
                           <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/50"><MessageCircle className="w-4 h-4" /></div>
                           <span className="text-sm font-mono">{t.vk}</span>
                        </a>
                      </li>
                   </ul>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                   <h3 className="text-sm font-bold text-white mb-2">{t.supportAuthor}</h3>
                   <p className="text-xs text-gray-400 mb-4 leading-relaxed">{t.supportDesc}</p>
                   <a href={BOOSTY_LINK} target="_blank" className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white text-center text-xs font-bold uppercase tracking-widest rounded transition-colors">{t.subscribe}</a>
                </div>
             </div>
             <div className="mt-auto pt-8 border-t border-white/10 text-center"><p className="text-[10px] text-gray-600 uppercase tracking-widest">{t.rights}</p></div>
          </div>
        </div>
      )}

      {/* --- AUTH MODAL --- */}
      {isAuthModalOpen && selectedChapter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-2xl mx-4">
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4 border border-red-500/30"><Lock className="w-8 h-8 text-red-500" /></div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">{t.lockedTitle}</h3>
                <p className="text-sm font-mono text-gray-400">{t.lockedDesc}</p>
              </div>
              <form onSubmit={handleCodeSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder={t.enterKeyPlaceholder} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-center text-white font-mono uppercase tracking-widest focus:outline-none focus:border-red-500 transition-colors" autoFocus />
                    {authError && <p className="text-red-500 text-xs text-center font-mono animate-pulse">{authError}</p>}
                 </div>
                 <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg uppercase tracking-widest transition-all">{t.unlock}</button>
              </form>
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                 <p className="text-xs text-gray-500 mb-2">{t.whereKey}</p>
                 <a href={BOOSTY_LINK} target="_blank" className="text-xs text-white/70 hover:text-white border-b border-white/30 hover:border-white transition-all pb-0.5 uppercase tracking-wide">{t.subscribe}</a>
              </div>
           </div>
        </div>
      )}

      {/* SIDEBAR */}
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
                <Icon className={`w-6 h-6 md:w-5 md:h-5 md:mr-4 mb-1 md:mb-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider">{t.cats[cat.id]}</span>
              </button>
            );
          })}
        </nav>
        
        {/* === BOTTOM SIDEBAR SECTION === */}
        <div className="hidden md:block p-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
           <div className="flex flex-col gap-4">
             
             <div className="flex items-center justify-between">
                 {/* КНОПКА INFO */}
                 <button onClick={() => setIsInfoMenuOpen(true)} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity text-left group">
                    <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30"><Info className="w-4 h-4 text-white" /></div>
                    <div className="text-xs"><p className="font-bold uppercase tracking-wide text-white">{t.infoBtn}</p></div>
                 </button>

                 <div className="flex items-center gap-2">
                     {/* --- КНОПКА АДМИНКИ (STEALTH) --- */}
                     <a href="/studio" target="_blank" className="p-2 opacity-0 hover:opacity-50 transition-all duration-500" title="Admin Panel">
                       <Edit className="w-3 h-3 text-white" />
                     </a>

                     {/* ЯЗЫК */}
                     <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:border-white/30 transition-all text-xs font-mono font-bold uppercase">
                         <Languages className="w-3 h-3" />
                         {lang === 'ru' ? 'RU' : 'EN'}
                     </button>
                 </div>
             </div>

             {/* --- AUDIO CONTROL --- */}
             <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 group hover:border-white/10 transition-colors">
                 <button onClick={toggleAudio} className={`flex-shrink-0 transition-colors ${isPlaying ? 'text-green-400' : 'text-white/30'}`}>
                   {isPlaying ? <Volume2 className="w-5 h-5" /> : (volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume1 className="w-5 h-5" />)}
                 </button>
                 <input 
                   type="range" 
                   min="0" 
                   max="1" 
                   step="0.05" 
                   value={volume} 
                   onChange={handleVolumeChange}
                   className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                 />
             </div>

           </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-700" style={{ backgroundImage: currentTheme.bgImage }}>
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b z-40" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--card-border)' }}>
            <h1 className="font-extrabold text-white text-lg tracking-tight uppercase">ПАРАЛЛЕЛЬ</h1>
            <div className="flex gap-4 items-center">
                <button onClick={toggleAudio} className={`p-2 rounded ${isPlaying ? 'text-green-500' : 'text-white/50'}`}>{isPlaying ? <Volume2 className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}</button>
                <button onClick={toggleLanguage} className="text-xs font-bold font-mono px-2 py-1 border border-white/20 rounded uppercase">{lang}</button>
                <button onClick={() => setIsInfoMenuOpen(true)} className="p-2 opacity-50 hover:opacity-100"><Menu className="w-6 h-6 text-white" /></button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 pb-24 md:pb-12 scroll-smooth z-10 relative">
          
          {activePost ? (
             <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center mb-8">
                 <button onClick={() => setActivePostId(null)} className="flex items-center gap-2 text-xs font-mono uppercase opacity-50 hover:opacity-100 transition-colors" style={{ color: 'var(--accent-color)' }}><ArrowLeft className="w-4 h-4" /> {t.return}</button>
                 <a href={`/studio/structure/post;${activePost._id}`} target="_blank" className="flex items-center gap-2 text-xs font-mono uppercase opacity-30 hover:opacity-100 transition-colors"><span className="hidden md:inline">{t.edit}</span><ExternalLink className="w-3 h-3" /></a>
               </div>
               
               {activePost.isPremium ? (
                 <div className="max-w-2xl mx-auto pt-10 text-center">
                   <div className="inline-block p-6 rounded-full border-2 mb-8 bg-white/5" style={{ borderColor: 'var(--card-border)' }}><Lock className="w-10 h-10" style={{ color: 'var(--accent-color)' }} /></div>
                   <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-wider">{t.accessDenied}</h2>
                   <p className="text-sm font-mono opacity-60 mb-10 max-w-md mx-auto">{t.encrypted}</p>
                   <a href={BOOSTY_LINK} target="_blank" rel="noopener noreferrer" className="inline-block border px-8 py-4 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--card-border)' }}>{t.buyKey}</a>
                 </div>
               ) : (
                 <article className="relative">
                    <header className="mb-10 pb-8 border-b border-dashed" style={{ borderColor: 'var(--card-border)' }}><h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">{activePost.title}</h1><div className="flex gap-4 text-xs font-mono opacity-60"><span>{formatDate(activePost.publishedAt, lang)}</span><span>CAT: {activePost.category?.toUpperCase() || 'GENERAL'}</span></div></header>
                    <div className="prose max-w-none prose-invert prose-p:leading-relaxed prose-headings:text-white prose-a:text-blue-400 prose-img:rounded-xl">
                       <PortableText value={activePost.content} components={ptComponents} />
                    </div>
                    {activePost.allowComments && (
                      <div className="mt-16 pt-10 border-t border-dashed" style={{ borderColor: 'var(--card-border)' }}>
                        <div className="flex items-center gap-2 mb-6 opacity-60"><MessageSquare className="w-4 h-4" /><span className="text-xs font-mono uppercase tracking-widest">{t.secureComms}</span></div>
                        <Giscus id="comments" repo="staerput-creator/parallel-app" repoId="R_kgDONR2d_A" category="Announcements" categoryId="DIC_kwDONR2d_M4Ckce_" mapping="pathname" term="Welcome to Parallel" reactionsEnabled="1" emitMetadata="0" inputPosition="top" theme="transparent_dark" lang={lang === 'ru' ? 'ru' : 'en'} loading="lazy" />
                      </div>
                    )}
                 </article>
               )}
             </div>
          ) : (
            <>
              {/* --- ПРОЗРАЧНЫЙ СТЕКЛЯННЫЙ HEADER --- */}
              <div className="sticky top-0 z-50 bg-transparent backdrop-blur-md pt-8 pb-6 mb-8 border-b border-white/5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-color)' }}></span>
                    <span className="text-xs font-mono opacity-70 uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>{t.systemOnline}</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tighter leading-none">
                    {t.cats[activeCategory]}
                </h2>
              </div>

              {/* --- VIEW: ROADMAP --- */}
              {activeCategory === 'roadmap' ? (
                <div className="w-full max-w-6xl mx-auto pb-20">
                    {!roadmapData ? (
                    <div className="p-10 border border-dashed text-center opacity-50 font-mono text-sm" style={{ borderColor: 'var(--card-border)' }}>{t.noData}</div>
                    ) : (
                    <div className="space-y-8">
                        {/* --- САМА КАРТА (ЗАГОЛОВОК УДАЛЕН) --- */}
                        <div className="relative w-full rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-[#050505] group">
                            {roadmapData.mapImageUrl ? (
                                <div className="relative w-full">
                                    {/* Фон */}
                                    <img 
                                        src={roadmapData.mapImageUrl} 
                                        alt="Tactical Map" 
                                        className="w-full h-auto block opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                                    />
                                    
                                    {/* Сетка */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                                    {/* --- ТОЧКИ --- */}
                                    {roadmapData.items?.map((item) => {
                                        if (item.x === undefined || item.y === undefined) return null;

                                        const isDone = item.status === 'done';
                                        const isInProgress = item.status === 'in-progress';
                                        
                                        return (
                                            <div 
                                                key={item._key}
                                                className="absolute group/marker"
                                                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                                            >
                                                {isInProgress && <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping w-full h-full scale-150"></div>}
                                                
                                                <div className={`relative z-10 w-4 h-4 md:w-6 md:h-6 rounded-full border-2 shadow-[0_0_10px_black] transition-transform duration-300 hover:scale-125 cursor-help flex items-center justify-center ${
                                                    isDone ? 'bg-green-600 border-green-400' :
                                                    isInProgress ? 'bg-blue-600 border-blue-400' :
                                                    'bg-gray-900 border-gray-500'
                                                }`}>
                                                    {isDone && <CheckCircle2 className="w-2 h-2 md:w-3 md:h-3 text-white" />}
                                                    {isInProgress && <Loader2 className="w-2 h-2 md:w-3 md:h-3 text-white animate-spin" />}
                                                    {!isDone && !isInProgress && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-black/90 border border-white/20 p-3 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none z-20 backdrop-blur-md">
                                                    <div className={`text-[10px] font-bold uppercase mb-1 ${
                                                        isDone ? 'text-green-400' : isInProgress ? 'text-blue-400' : 'text-gray-400'
                                                    }`}>
                                                        {isDone ? t.statusDone : isInProgress ? t.statusProgress : t.statusPlanned}
                                                    </div>
                                                    <h4 className="text-white font-bold text-xs leading-tight mb-1">{item.title}</h4>
                                                    {item.description && <p className="text-[10px] text-gray-400 leading-tight">{item.description}</p>}
                                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 border-r border-b border-white/20 rotate-45"></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-red-500 font-mono border border-red-900 bg-red-900/10">
                                    NO MAP IMAGE DATA RECEIVED
                                </div>
                            )}
                        </div>

                        {/* --- СПИСОК (Легенда) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {roadmapData.items?.map((item) => (
                                <div key={item._key} className={`p-4 rounded border flex items-start gap-3 bg-white/5 ${
                                    item.status === 'done' ? 'border-green-500/20 hover:border-green-500/50' : 
                                    item.status === 'in-progress' ? 'border-blue-500/20 hover:border-blue-500/50' : 
                                    'border-white/10 hover:border-white/30'
                                } transition-colors`}>
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                        item.status === 'done' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                                        item.status === 'in-progress' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse' : 
                                        'bg-gray-500'
                                    }`} />
                                    <div>
                                        <h3 className={`text-sm font-bold ${item.status === 'done' ? 'text-gray-400 line-through' : 'text-white'}`}>{item.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{item.description || '...'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    )}
                </div>
              ) : activeCategory === 'premium' ? (
                // ... (Premium и Posts код остается таким же) ...
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredChapters.length === 0 && <div className="col-span-full p-10 border border-dashed text-center opacity-50 font-mono text-sm" style={{ borderColor: 'var(--card-border)' }}>{t.noChapters}</div>}
                  {filteredChapters.map((chapter) => {
                    const isLocked = !!chapter.accessCode;
                    return (
                      <div key={chapter._id} onClick={() => handleChapterClick(chapter)} className="cursor-pointer group relative bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-red-500/50 transition-all hover:-translate-y-1 h-[400px] flex flex-col">
                        <div className="h-2/3 bg-[#222] relative overflow-hidden">
                          {chapter.coverUrl ? (
                            <img src={chapter.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-red-900/20 group-hover:bg-red-900/30 transition-colors"><BookOpen className="w-12 h-12 text-red-500 opacity-50" /></div>
                          )}
                          <div className="absolute top-4 right-4">
                            {isLocked ? (
                              <div className="bg-black/80 backdrop-blur text-yellow-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-yellow-500/30"><Lock className="w-3 h-3" /> {t.premium}</div>
                            ) : (
                              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">{t.free}</div>
                            )}
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="text-xs font-mono text-gray-500 mb-2">{t.chapter} {chapter.chapterNumber.toString().padStart(2, '0')}</div>
                          <h3 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors line-clamp-2">{chapter.title}</h3>
                          <div className="mt-auto flex items-center text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                            {!isLocked ? (<><Play className="w-4 h-4 mr-2 fill-current" /> {t.read}</>) : (<><KeyRound className="w-4 h-4 mr-2" /> {t.enterCode}</>)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.length === 0 && <div className="col-span-full p-10 border border-dashed text-center opacity-50 font-mono text-sm" style={{ borderColor: 'var(--card-border)' }}>{t.noData}</div>}
                  {filteredPosts.filter(p => activeCategory === 'all' || p.category === activeCategory).map((post) => (
                    <article key={post._id} onClick={() => setActivePostId(post._id)} className="relative flex flex-col h-full border opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer group overflow-hidden animate-in slide-in-from-bottom-4 fill-mode-forwards" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--card-border)', animationDelay: `${100}ms` }}>
                      <div className="p-6 flex flex-col h-full relative z-10">
                          <div className="flex justify-between items-start mb-4">
                              <span className="text-[9px] font-mono uppercase border px-2 py-1" style={{ borderColor: 'var(--card-border)', color: 'var(--accent-color)' }}>{post.label || 'INFO'}</span>
                              {post.isPremium && <Lock className="w-3 h-3" style={{ color: 'var(--accent-color)' }} />}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                          <div className="mt-auto pt-4 border-t border-dashed flex justify-between items-center text-[10px] opacity-60 font-mono uppercase" style={{ borderColor: 'var(--card-border)' }}>
                              <span>{formatDate(post.publishedAt, lang)}</span>
                              <span className="group-hover:translate-x-1 transition-transform">{">>>"}</span>
                          </div>
                      </div>
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
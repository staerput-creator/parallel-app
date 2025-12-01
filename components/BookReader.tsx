'use client';

import React, { useRef, useEffect, forwardRef, useState } from 'react';
// @ts-ignore
import HTMLFlipBookRaw from 'react-pageflip';
import { PortableText } from '@portabletext/react';
import { Lock, ExternalLink, ArrowRight, XCircle } from 'lucide-react';

const HTMLFlipBook = HTMLFlipBookRaw as any;
const FLIP_SOUND = '/sounds/page-flip.mp3';
const BOOSTY_LINK = "https://boosty.to/parallel-game"; 

const Page = forwardRef((props: any, ref: any) => {
  return (
    <div className="page-content bg-[#fdfbf7] text-black h-full w-full p-8 shadow-inner border-r border-gray-300 overflow-hidden relative" ref={ref}>
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
      <div className="relative z-10 h-full flex flex-col">
        <div className="text-center text-gray-400 text-xs mb-4 font-mono">- {props.number} -</div>
        {props.data.imageUrl && (
           <div className="mb-6 rounded-lg overflow-hidden border-4 border-double border-black/20 sepia-[.3]">
             <img src={props.data.imageUrl} className="w-full h-auto object-cover" alt="" />
           </div>
        )}
        <div className="prose prose-stone prose-sm font-serif leading-relaxed flex-1 overflow-y-auto custom-scrollbar">
           {props.data.content && <PortableText value={props.data.content} />}
        </div>
      </div>
    </div>
  );
});
Page.displayName = 'Page';

export default function BookReader({ chapter }: { chapter: any }) {
  const bookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isLocked, setIsLocked] = useState(false); 
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasCode = !!chapter.accessCode;
    const savedCode = localStorage.getItem(`access_${chapter._id}`);
    
    if (hasCode && savedCode !== chapter.accessCode) {
        setIsLocked(true);
    } else {
        setIsLocked(false);
    }

    // Инициализация звука перелистывания
    flipAudioRef.current = new Audio(FLIP_SOUND);
    flipAudioRef.current.volume = 0.5;

    // --- ФИКС ЗВУКА: ОЧИСТКА ПРИ ВЫХОДЕ СО СТРАНИЦЫ ---
    return () => {
      // Этот код сработает автоматически, когда ты нажмешь "Назад" или уйдешь со страницы
      if (audioRef.current) {
        audioRef.current.pause(); // Останавливаем звук
        audioRef.current.currentTime = 0; // Перематываем
        audioRef.current = null; // Удаляем ссылку
      }
      if (flipAudioRef.current) {
        flipAudioRef.current.pause();
        flipAudioRef.current = null;
      }
    };
  }, [chapter._id, chapter.accessCode]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim() === chapter.accessCode) {
        setIsLocked(false);
        localStorage.setItem(`access_${chapter._id}`, inputCode.trim()); 
        setError(false);
    } else {
        setError(true); 
        setTimeout(() => setError(false), 500);
    }
  };

  const onFlip = (e: any) => {
    // Звук листания
    if (flipAudioRef.current) {
      flipAudioRef.current.currentTime = 0;
      flipAudioRef.current.play().catch(() => {});
    }
    
    // Звук страницы (атмосфера)
    const bookPageIndex = e.data;
    // Корректировка индекса: в книге стр.0 - обложка, стр.1 - это первая страница контента (индекс 0 в массиве)
    const dataIndex = bookPageIndex - 1; 
    
    // Сначала всегда останавливаем старый звук
    if (audioRef.current) {
        audioRef.current.pause();
    }

    if (dataIndex < 0) return;
    
    const pageData = chapter.pages ? chapter.pages[dataIndex] : null;
    
    if (pageData?.soundUrl) {
      const audio = new Audio(pageData.soundUrl);
      audio.volume = 0.3;
      audioRef.current = audio;
      audio.play().catch(() => {});
    }
  };

  if (!mounted) {
    return <div className="h-screen flex items-center justify-center text-white">Загрузка книги...</div>;
  }

  // --- ЭКРАН БЛОКИРОВКИ ---
  if (isLocked) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black"></div>
            
            <div className="relative z-10 max-w-md w-full bg-[#111] border border-red-900/30 p-8 rounded-2xl shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <Lock className="w-8 h-8 text-red-500" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest text-white">Доступ Заблокирован</h2>
                <p className="text-gray-400 text-sm mb-8 font-mono">
                    Для чтения главы "{chapter.title}" требуется код доступа.
                </p>

                <form onSubmit={handleUnlock} className="mb-6 relative">
                    <input 
                        type="text" 
                        placeholder="ВВЕДИТЕ КОД" 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        className={`w-full bg-black/50 border ${error ? 'border-red-600' : 'border-white/10 focus:border-white/30'} rounded-lg py-4 px-6 text-center text-white placeholder-gray-600 outline-none transition-all uppercase tracking-[0.2em] font-mono text-lg`}
                    />
                    <button type="submit" className="absolute right-3 top-3 p-2 bg-white/10 hover:bg-white/20 rounded transition-colors">
                        <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                </form>
                
                {error && <p className="text-red-500 text-xs mb-6 font-mono animate-bounce">ОШИБКА: НЕВЕРНЫЙ КОД</p>}

                <div className="pt-6 border-t border-white/5">
                    <p className="text-xs text-gray-600 mb-4 uppercase tracking-wider">Нет кода?</p>
                    <a 
                        href={BOOSTY_LINK} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium rounded-lg transition-all text-sm group"
                    >
                        <XCircle className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                        <span>Получить код на Boosty</span>
                        <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                    </a>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-[#1a1a1a] py-10 overflow-hidden">
      <HTMLFlipBook
        width={400} height={600} size="fixed" minWidth={300} maxWidth={500} minHeight={400} maxHeight={700}
        maxShadowOpacity={0.5} showCover={true} mobileScrollSupport={true} onFlip={onFlip} ref={bookRef}
        className="shadow-2xl" startPage={0} drawShadow={true} flippingTime={1000} usePortrait={true}
        startZIndex={0} autoSize={true} clickEventForward={true} useMouseEvents={true} swipeDistance={30}
        showPageCorners={true} disableFlipByClick={false}
      >
        <div className="page-cover bg-[#2a2a2a] text-white shadow-2xl overflow-hidden cursor-pointer border-r border-black/50">
            {chapter.coverUrl ? (
                <img src={chapter.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
                <div className="h-full w-full bg-red-900 p-10 flex flex-col items-center justify-center border-[10px] border-double border-yellow-600/50">
                    <h1 className="text-4xl font-bold uppercase text-center mb-4 tracking-widest text-yellow-500 drop-shadow-md">{chapter.title}</h1>
                    <p className="text-xs font-mono opacity-50 tracking-[0.3em]">SECRET FILES</p>
                </div>
            )}
        </div>
        {chapter.pages?.map((page: any, index: number) => (
          <Page key={index} number={index + 1} data={page} />
        ))}
        <div className="page-cover bg-red-950 p-10 border-l border-black/50"></div>
      </HTMLFlipBook>
    </div>
  );
}
'use client';

import React, { useRef, useEffect, forwardRef } from 'react';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';
import { PortableText } from '@portabletext/react';

// Звук перелистывания
const FLIP_SOUND = '/sounds/page-flip.mp3';

// --- КОМПОНЕНТ СТРАНИЦЫ ---
const Page = forwardRef((props: any, ref: any) => {
  return (
    <div className="page-content bg-[#fdfbf7] text-black h-full w-full p-8 shadow-inner border-r border-gray-300 overflow-hidden relative" ref={ref}>
      
      {/* Текстура бумаги */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="text-center text-gray-400 text-xs mb-4 font-mono">- {props.number} -</div>

        {/* ИСПРАВЛЕНИЕ 1: Проверяем imageUrl, а не image */}
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

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function BookReader({ chapter }: { chapter: any }) {
  const bookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    flipAudioRef.current = new Audio(FLIP_SOUND);
    flipAudioRef.current.volume = 0.5;
  }, []);

  const onFlip = (e: any) => {
    // 1. Звук листания
    if (flipAudioRef.current) {
      flipAudioRef.current.currentTime = 0;
      flipAudioRef.current.play().catch(() => {});
    }

    // 2. ИСПРАВЛЕНИЕ 2: Логика звука страниц
    // Индекс 0 = Обложка. Индекс 1 = Первая страница данных.
    const bookPageIndex = e.data;
    const dataIndex = bookPageIndex - 1; // Смещаем индекс

    // Останавливаем старый звук
    if (audioRef.current) {
        audioRef.current.pause();
    }

    // Если это обложка (индекс < 0) — выходим, ничего не играем
    if (dataIndex < 0) return;

    // Берем данные текущей страницы
    const pageData = chapter.pages[dataIndex];

    if (pageData?.soundUrl) {
      const audio = new Audio(pageData.soundUrl);
      audio.volume = 0.3;
      audioRef.current = audio;
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#1a1a1a] py-10">
      
      <HTMLFlipBook
        width={400}
        height={600}
        size="fixed"
        minWidth={300}
        maxWidth={500}
        minHeight={400}
        maxHeight={700}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={onFlip}
        ref={bookRef}
        className="shadow-2xl"
        startPage={0}
        drawShadow={true}
        flippingTime={1000}
        usePortrait={true}
        startZIndex={0}
        autoSize={true}
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
      >
        {/* ОБЛОЖКА (Страница 0) */}
        <div className="page-cover bg-[#2a2a2a] text-white shadow-2xl overflow-hidden cursor-pointer">
            {chapter.coverUrl ? (
                // Если в админке есть обложка - показываем её
                <img 
                    src={chapter.coverUrl} 
                    alt="Book Cover" 
                    className="w-full h-full object-cover" 
                />
            ) : (
                // Если обложки нет - показываем стандартную красную папку
                <div className="h-full w-full bg-red-900 p-10 flex flex-col items-center justify-center border-[10px] border-double border-yellow-600/50">
                    <h1 className="text-4xl font-bold uppercase text-center mb-4 tracking-widest text-yellow-500 drop-shadow-md">{chapter.title}</h1>
                    <p className="text-xs font-mono opacity-50 tracking-[0.3em]">TOP SECRET // CLASSIFIED</p>
                </div>
            )}
        </div>

        {/* СТРАНИЦЫ (Начинаются с индекса 1) */}
        {chapter.pages?.map((page: any, index: number) => (
          <Page key={index} number={index + 1} data={page} />
        ))}

        {/* ЗАДНЯЯ ОБЛОЖКА */}
        <div className="page-cover bg-red-950 p-10"></div>

      </HTMLFlipBook>
    </div>
  );
}
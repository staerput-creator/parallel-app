'use client';

import React from 'react';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/sanity/client';
import { ArrowLeft, Lock, MessageSquare, BarChart3 } from 'lucide-react';
import Giscus from '@giscus/react';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

// Компоненты для рендера контента
const ptComponents = {
  types: {
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
    strawpoll: ({ value }: any) => {
      if (!value?.url) return null;
      const getEmbedUrl = (url: string) => { try { return `https://strawpoll.com/embed/${url.split('/').pop()}`; } catch { return ''; } };
      return (
        <div className="my-10 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400">
            <BarChart3 className="w-4 h-4" /> Голосование
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
               <img src={urlFor(value.image).width(800).url()} alt="Split" className="rounded-lg shadow-xl border border-white/10 w-full h-auto object-cover" />
            </div>
            <div className="flex-1 min-w-0"><PortableText value={value.text} /></div>
          </div>
        );
      }
  }
};

export default function PostView({ post, onBack }: { post: any, onBack?: () => void }) {
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 text-white">
      {onBack && (
        <div className="flex justify-between items-center mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-mono uppercase opacity-50 hover:opacity-100 transition-colors text-white">
            <ArrowLeft className="w-4 h-4" /> Return
            </button>
        </div>
      )}

      {post.isPremium ? (
        <div className="max-w-2xl mx-auto pt-10 text-center">
            <div className="inline-block p-6 rounded-full border-2 border-white/10 mb-8 bg-white/5"><Lock className="w-10 h-10 text-rose-500" /></div>
            <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-wider">Доступ Запрещен</h2>
            <p className="text-sm font-mono opacity-60 mb-10 max-w-md mx-auto">Премиум контент.</p>
        </div>
      ) : (
        <article className="relative">
            <header className="mb-10 pb-8 border-b border-dashed border-white/20">
                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">{post.title}</h1>
                <div className="flex gap-4 text-xs font-mono opacity-60">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span>CAT: {post.category?.toUpperCase() || 'GENERAL'}</span>
                </div>
            </header>
            <div className="prose max-w-none prose-invert prose-p:leading-relaxed prose-headings:text-white prose-a:text-blue-400 prose-img:rounded-xl">
                <PortableText value={post.content} components={ptComponents} />
            </div>
            
            {post.allowComments && (
                <div className="mt-16 pt-10 border-t border-dashed border-white/20">
                <div className="flex items-center gap-2 mb-6 opacity-60"><MessageSquare className="w-4 h-4" /><span className="text-xs font-mono uppercase tracking-widest">Secure Comms Channel</span></div>
                <Giscus id="comments" repo="staerput-creator/parallel-app" repoId="R_kgDONR2d_A" category="Announcements" categoryId="DIC_kwDONR2d_M4Ckce_" mapping="pathname" term="Welcome to Parallel" reactionsEnabled="1" emitMetadata="0" inputPosition="top" theme="transparent_dark" lang="ru" loading="lazy" />
                </div>
            )}
        </article>
      )}
    </div>
  );
}
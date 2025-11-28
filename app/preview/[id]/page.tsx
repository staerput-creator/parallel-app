'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from "next-sanity";
import PostView from "@/components/PostView";
import { useParams } from 'next/navigation';

// Создаем клиент с токеном прямо в браузере
// ВАЖНО: Токен должен быть с правами Viewer
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false, // Отключаем кеш, чтобы видеть свежие изменения
  token: process.env.NEXT_PUBLIC_SANITY_VIEWER_TOKEN, 
  ignoreBrowserTokenWarning: true 
});

export default function PreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Функция загрузки
    const fetchPost = async () => {
      try {
        // Запрос берет либо черновик (drafts.), либо опубликованный документ
        // Приоритет у черновика благодаря сортировке по _updatedAt
        const query = `*[_id == "${id}" || _id == "drafts.${id}"] | order(_updatedAt desc)[0]`;
        const data = await client.fetch(query);
        setPost(data);
      } catch (e) {
        console.error("Ошибка загрузки превью:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    // Подписка на обновления в реальном времени
    const subscription = client
      .listen(`*[_id == "${id}" || _id == "drafts.${id}"]`)
      .subscribe((update) => {
        console.log('Update received:', update);
        // Небольшая задержка, чтобы база успела обновиться
        setTimeout(fetchPost, 1000);
      });

    return () => subscription.unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Loading Preview...
      </div>
    );
  }

  if (!post) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white p-10">Post not found</div>;
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen p-4">
        {/* Используем наш компонент отображения поста */}
        <PostView post={post} />
    </div>
  );
}
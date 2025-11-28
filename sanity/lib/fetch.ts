import { draftMode } from 'next/headers'
import { client } from '@/sanity/client'

// Токен должен быть в .env.local
const token = process.env.SANITY_VIEWER_TOKEN

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags,
}: {
  query: string
  params?: any
  tags?: string[]
}) {
  // --- ФИКС ДЛЯ Next.js 15 ---
  // draftMode() теперь возвращает Promise, поэтому нужно await
  const draft = await draftMode() 
  const isDraftMode = draft.isEnabled

  if (isDraftMode && !token) {
    throw new Error('Отсутствует токен SANITY_VIEWER_TOKEN')
  }

  // Если режим черновика включен - используем токен и не кешируем
  return client.fetch<QueryResponse>(query, params, {
    ...(isDraftMode && {
      token: token,
      perspective: 'previewDrafts',
      useCdn: false,
      next: { revalidate: 0 }, // Мгновенное обновление
    }),
    ...(!isDraftMode && {
      perspective: 'published',
      useCdn: true,
      next: { revalidate: 60, tags }, // Кеш на 60 секунд для обычных людей
    }),
  })
}
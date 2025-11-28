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
  const isDraftMode = draftMode().isEnabled

  if (isDraftMode && !token) {
    throw new Error('Missing SANITY_VIEWER_TOKEN')
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
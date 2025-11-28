'use client'

import dynamic from 'next/dynamic'
import config from '../../../sanity.config'

// Мы загружаем админку динамически и ОТКЛЮЧАЕМ серверный рендер (ssr: false)
// Это лечит ошибку "Hydration failed"
const NextStudio = dynamic(
  () => import('next-sanity/studio').then((d) => d.NextStudio),
  { ssr: false }
)

export default function StudioPage() {
  return <NextStudio config={config} />
}
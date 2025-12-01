import {defineField, defineType} from 'sanity'
import {PlayCircle} from 'lucide-react'

export default defineType({
  name: 'vkvideo',
  type: 'object',
  title: 'VK Видео',
  icon: PlayCircle,
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'Ссылка на видео VK',
      description: 'Вставь ссылку вида https://vk.com/video-...',
      validation: (rule) => rule.required()
    }),
  ],
  preview: {
    select: { url: 'url' },
    prepare({url}) {
      return {
        title: 'VK Video',
        subtitle: url,
      }
    },
  },
})
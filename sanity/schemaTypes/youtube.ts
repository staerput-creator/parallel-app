import {defineField, defineType} from 'sanity'
import {Play} from 'lucide-react'

export default defineType({
  name: 'youtube',
  type: 'object',
  title: 'YouTube Видео',
  icon: Play,
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'Ссылка на видео',
      description: 'Вставь ссылку вида https://www.youtube.com/watch?v=...',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']})
    }),
  ],
  preview: {
    select: { url: 'url' },
    prepare({url}) {
      return {
        title: 'YouTube Video',
        subtitle: url,
      }
    },
  },
})
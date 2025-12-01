import {defineField, defineType} from 'sanity'
import {MonitorPlay} from 'lucide-react'

export default defineType({
  name: 'rutube',
  type: 'object',
  title: 'RuTube Видео',
  icon: MonitorPlay,
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'Ссылка на видео RuTube',
      description: 'Вставь ссылку вида https://rutube.ru/video/...',
      validation: (rule) => rule.required()
    }),
  ],
  preview: {
    select: { url: 'url' },
    prepare({url}) {
      return {
        title: 'RuTube Video',
        subtitle: url,
      }
    },
  },
})
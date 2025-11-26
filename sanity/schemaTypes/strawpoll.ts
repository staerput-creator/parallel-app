import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'strawpoll',
  title: '📊 Опрос (StrawPoll)',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Ссылка на опрос',
      description: 'Вставь ссылку вида https://strawpoll.com/xyz...',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'title',
      title: 'Название (для себя)',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'url' },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Опрос',
        subtitle: subtitle,
      }
    }
  }
})
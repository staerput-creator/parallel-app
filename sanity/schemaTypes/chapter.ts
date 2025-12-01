import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'chapter',
  title: '📖 Главы Книги (Flipbook)',
  type: 'document',
  fields: [
    defineField({
      name: 'chapterNumber',
      title: 'Номер главы',
      type: 'number',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'title',
      title: 'Название главы',
      type: 'string',
    }),
    // --- НОВОЕ ПОЛЕ ---
    defineField({
      name: 'accessCode',
      title: '🔑 Код доступа (Пароль)',
      description: 'Если это поле заполнено, глава будет закрыта замком. Читатель должен ввести этот код, чтобы открыть её. Код ты публикуешь в закрытом посте на Бусти.',
      type: 'string',
    }),
    // ------------------
    defineField({
      name: 'cover',
      title: 'Обложка книги',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'slug',
      title: 'Slug (Ссылка)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pages',
      title: 'Страницы',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'page',
          title: 'Страница',
          fields: [
            {
              name: 'content',
              title: 'Текст страницы',
              type: 'array',
              of: [{ type: 'block' }]
            },
            {
              name: 'image',
              title: 'Иллюстрация',
              type: 'image'
            },
            {
              name: 'soundEffect',
              title: '🔊 Звук',
              type: 'file',
              options: { accept: 'audio/*' }
            }
          ]
        }
      ]
    })
  ],
  orderings: [
    {
      title: 'По номеру главы',
      name: 'chapterNumberAsc',
      by: [
        {field: 'chapterNumber', direction: 'asc'}
      ]
    }
  ]
})
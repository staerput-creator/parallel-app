import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Записи (Посты)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Ссылка (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Категория',
      type: 'string',
      options: {
        list: [
          { title: 'Сводка (Общее)', value: 'all' },
          { title: 'Девблог (Код)', value: 'devblog' },
          { title: 'Архивы (Лор)', value: 'lore' },
          { title: 'Книга', value: 'premium' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Метка',
      type: 'string',
    }),
    defineField({
      name: 'isPremium',
      title: '🔒 Доступ только по подписке',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Дата публикации',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'content',
      title: 'Текст статьи',
      type: 'array',
      of: [
        { type: 'block' }, // Текст
        {
          type: 'image', // <--- ВОТ ЧТО МЫ ДОБАВИЛИ
          options: { hotspot: true }, // Позволяет кадрировать фото
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Подпись к фото',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text', // Для слепых и SEO
            }
          ]
        }
      ],
    }),
  ],
})
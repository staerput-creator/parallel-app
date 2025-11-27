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
      name: 'allowComments',
      title: '💬 Разрешить комментарии',
      type: 'boolean',
      initialValue: true,
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
        // 1. ОБЫЧНЫЙ ТЕКСТ
        { 
          type: 'block',
          styles: [
            {title: 'Обычный', value: 'normal'},
            {title: 'Заголовок 1', value: 'h1'},
            {title: 'Заголовок 2', value: 'h2'},
            {title: 'Заголовок 3', value: 'h3'},
            {title: 'Цитата', value: 'blockquote'},
          ],
          lists: [
            {title: 'Список', value: 'bullet'},
            {title: 'Нумерация', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: 'Жирный', value: 'strong'},
              {title: 'Курсив', value: 'em'},
              {title: 'Подчеркнутый', value: 'underline'},
              {title: 'Зачеркнутый', value: 'strike-through'},
              {title: 'Код', value: 'code'}
            ],
            annotations: [
              {
                title: 'Ссылка',
                name: 'link',
                type: 'object',
                fields: [{title: 'URL', name: 'href', type: 'url'}],
              },
            ],
          },
        }, 
        // 2. ОБЫЧНАЯ КАРТИНКА (На всю ширину)
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', type: 'string', title: 'Подпись' },
            { name: 'alt', type: 'string', title: 'Alt Text' }
          ]
        },
        // 3. ОПРОС
        { type: 'strawpoll' },
        
        // 4. НОВОЕ: СЕКЦИЯ "ФОТО + ТЕКСТ" (Твой чертеж)
        {
          name: 'splitImage',
          title: '📰 Секция: Фото + Текст',
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Изображение',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'layout',
              title: 'Расположение',
              type: 'string',
              options: {
                list: [
                  { title: '📷 Фото СЛЕВА (1/2)', value: 'left-half' },
                  { title: '📷 Фото СЛЕВА (1/3)', value: 'left-third' },
                  { title: '📸 Фото СПРАВА (1/2)', value: 'right-half' },
                  { title: '📸 Фото СПРАВА (1/3)', value: 'right-third' },
                ],
                layout: 'radio'
              },
              initialValue: 'left-half'
            },
            {
              name: 'text',
              title: 'Текст рядом',
              type: 'array',
              of: [{ type: 'block' }] // Вложенный редактор текста
            }
          ],
          preview: {
            select: {
              media: 'image',
              layout: 'layout'
            },
            prepare({ media, layout }) {
              return {
                title: 'Секция Фото + Текст',
                subtitle: `Макет: ${layout}`,
                media: media
              }
            }
          }
        }
      ],
    }),
  ],
})
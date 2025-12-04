import { defineField, defineType } from 'sanity'
import { Map, Crosshair } from 'lucide-react'
import { MapPointInput } from '@/sanity/components/MapPointImput' // <-- Импортируем компонент

export default defineType({
  name: 'roadmap',
  title: '🗺️ Военная Карта (Roadmap)',
  type: 'document',
  icon: Map,
  fields: [
    defineField({
      name: 'title',
      title: 'Название операции',
      type: 'string',
      initialValue: 'Освобождение Южного Сахалина'
    }),
    defineField({
      name: 'mapImage',
      title: 'Фон Карты',
      type: 'image',
      description: 'Загрузи сюда старую карту Сахалина',
      options: { hotspot: true }
    }),
    defineField({
      name: 'items',
      title: 'Точки на карте',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Цель',
          icon: Crosshair,
          // ВОТ ЗДЕСЬ МАГИЯ: Подключаем компонент ко всему объекту
          components: {
            input: MapPointInput
          },
          fields: [
            { name: 'title', title: 'Название точки (Город/Высота)', type: 'string' },
            { name: 'description', title: 'Описание задачи', type: 'string' },
            { 
              name: 'status', 
              title: 'Статус', 
              type: 'string', 
              options: {
                list: [
                  { title: '🚩 Захвачено (Готово)', value: 'done' },
                  { title: '⚔️ Бой (В работе)', value: 'in-progress' },
                  { title: '📍 Разведка (В планах)', value: 'planned' }
                ],
                layout: 'radio'
              },
              initialValue: 'planned'
            },
            // Скрываем поля X и Y из интерфейса (readOnly или hidden), 
            // чтобы они не мешали, но они все равно будут заполняться кликом.
            // Можно оставить их visible, чтобы видеть цифры.
            { 
              name: 'x', 
              title: 'X %', 
              type: 'number', 
              validation: r => r.min(0).max(100),
              readOnly: true // Чтобы руками не ломали, только кликом
            },
            { 
              name: 'y', 
              title: 'Y %', 
              type: 'number', 
              validation: r => r.min(0).max(100),
              readOnly: true
            }
          ],
          preview: {
            select: { title: 'title', status: 'status' },
            prepare({ title, status }) {
               const s = status === 'done' ? '🚩' : status === 'in-progress' ? '⚔️' : '📍';
               return { title, subtitle: `${s} ${status}` }
            }
          }
        }
      ]
    })
  ]
})
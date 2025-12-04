import React, { useCallback, useMemo } from 'react'
import { Box, Text, Flex, Card } from '@sanity/ui'
import { set, unset, PatchEvent } from 'sanity'
import { useFormValue } from 'sanity' // Хук, чтобы достать картинку из корня документа
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/sanity/client' // Импортируй свой клиент

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  return builder.image(source)
}

export const MapPointInput = (props: any) => {
  const { elementProps, onChange, value } = props
  
  // 1. Достаем картинку карты из корня документа (поле mapImage)
  const mapImage = useFormValue(['mapImage']) as any

  // 2. Функция обработки клика
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      
      // Считаем позицию клика внутри элемента
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Переводим в проценты (0-100)
      const xPercent = (x / rect.width) * 100
      const yPercent = (y / rect.height) * 100

      // 3. Отправляем патч в Sanity (обновляем поля x и y)
      // Важно: так как мы находимся внутри объекта, нам нужно патчить текущий путь
      // Но стандартный onChange для ObjectInput сложнее, поэтому мы сделаем хитрость:
      // Мы будем рендерить это поле как "визуальную надстройку" над стандартными полями.
      
      // В данном случае props.onChange ожидает изменения САМОГО поля, к которому привязан компонент.
      // Чтобы менять соседей (x и y), удобнее использовать этот компонент как обертку над объектом.
      
      // Упрощение: Мы просто вызовем onChange, передав патчи для путей 'x' и 'y'
      onChange(PatchEvent.from([
        set(Number(xPercent.toFixed(2)), ['x']),
        set(Number(yPercent.toFixed(2)), ['y'])
      ]))
    },
    [onChange]
  )

  // Получаем текущие координаты
  const xVal = value?.x || 50
  const yVal = value?.y || 50

  return (
    <Box>
      {/* Рендерим стандартные поля (Title, Desc, Status и т.д.) */}
      <Box marginBottom={4}>{props.renderDefault(props)}</Box>

      <Card padding={3} border radius={2} tone="primary">
        <Text size={1} weight="bold" style={{marginBottom: '10px'}}>📍 Укажи точку на карте (Кликни)</Text>
        
        {mapImage ? (
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              cursor: 'crosshair',
              lineHeight: 0, // Убирает отступы под картинкой
              overflow: 'hidden',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            onClick={handleClick}
          >
            {/* Сама карта */}
            <img 
              src={urlFor(mapImage).width(800).url()} 
              alt="Map base" 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />

            {/* Маркер текущей позиции */}
            {value?.x !== undefined && (
              <div
                style={{
                  position: 'absolute',
                  left: `${value.x}%`,
                  top: `${value.y}%`,
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  pointerEvents: 'none', // Чтобы клик проходил сквозь точку
                  transition: 'left 0.2s, top 0.2s'
                }}
              />
            )}
          </div>
        ) : (
          <Flex align="center" justify="center" padding={4} style={{background: '#f0f0f0'}}>
            <Text>Сначала загрузи "Фон Карты" в основном документе!</Text>
          </Flex>
        )}
        
        {/* Отладочная инфа */}
        <Flex justify="space-between" marginTop={3}>
           <Text size={0} muted>X: {value?.x?.toFixed(1)}%</Text>
           <Text size={0} muted>Y: {value?.y?.toFixed(1)}%</Text>
        </Flex>
      </Card>
    </Box>
  )
}
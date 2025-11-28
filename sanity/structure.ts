import {type StructureBuilder} from 'sanity/structure'
// Нам нужен этот плагин. Если он удален - установи его: npm install sanity-plugin-iframe-pane
import {Iframe} from 'sanity-plugin-iframe-pane'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Контент')
    .items([
      // Фильтруем "post" из основного списка, чтобы настроить его вручную
      ...S.documentTypeListItems().filter(
        (listItem) => listItem.getId() !== 'post'
      ),
      
      // Настраиваем пункт "Записи"
      S.listItem()
        .title('Записи')
        .schemaType('post')
        .child(
          S.documentTypeList('post')
            .title('Записи')
            .child((documentId) =>
              S.document()
                .documentId(documentId)
                .schemaType('post')
                .views([
                  S.view.form(), // Вкладка редактора
                  
                  // Вкладка ПРЕДПРОСМОТРА
                  S.view
                    .component(Iframe)
                    .options({
                      url: (doc: any) => {
                        // Получаем ID черновика или опубликованного документа
                        const id = doc?._id?.replace('drafts.', '');
                        
                        // Определяем базовый URL (локально или продакшн)
                        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                        
                        return `${origin}/preview/${id}`;
                      },
                      reload: { button: true }, // Кнопка "Обновить"
                      attributes: {
                        allow: 'fullscreen', 
                      }
                    })
                    .title('👀 Предпросмотр')
                    .id('preview') // <--- ДОБАВИЛ ЭТУ СТРОЧКУ (Фикс ошибки)
                ])
            )
        )
    ])
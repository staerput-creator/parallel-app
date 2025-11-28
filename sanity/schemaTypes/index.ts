import { type SchemaTypeDefinition } from 'sanity'
import post from './post'
import chapter from './chapter'
// Если у тебя есть файл strawpoll.ts, раскомментируй импорт ниже:
import strawpoll from './strawpoll' 

export const schema: { types: SchemaTypeDefinition[] } = {
  // Добавляем strawpoll в список, чтобы post.ts не ругался
  types: [post, chapter, strawpoll], 
}
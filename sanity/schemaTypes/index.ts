import { type SchemaTypeDefinition } from 'sanity'
import post from './post'
import strawpoll from './strawpoll' // <-- Добавили

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, strawpoll], // <-- Добавили в массив
}
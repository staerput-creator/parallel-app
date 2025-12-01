import { type SchemaTypeDefinition } from 'sanity'
import post from './post'
import chapter from './chapter'
import strawpoll from './strawpoll' 
import youtube from './youtube'
import vkvideo from './vkvideo' // <-- 1
import rutube from './rutube'   // <-- 2

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, chapter, strawpoll, youtube, vkvideo, rutube], // <-- Добавь в список
}
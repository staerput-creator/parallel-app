import { type SchemaTypeDefinition } from 'sanity'
import post from './post'
import chapter from './chapter'
import strawpoll from './strawpoll' 
import youtube from './youtube'
import vkvideo from './vkvideo' 
import rutube from './rutube'
import roadmap from './roadmap'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, chapter, strawpoll, youtube, vkvideo, rutube, roadmap], // <-- Добавь в список
}
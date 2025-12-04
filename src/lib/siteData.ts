import { Activity, Cpu, FileText, BookOpen, Map as MapIcon } from 'lucide-react';

// --- Types ---
export type CategoryId = 'all' | 'devblog' | 'lore' | 'premium' | 'roadmap';
export type Language = 'ru' | 'en';

export interface ThemeConfig {
  className: string;
  subtitle: string;
  bgImage: string;
}

// --- Config ---
export const categories: { id: CategoryId; icon: any }[] = [
  { id: 'all', icon: Activity },
  { id: 'devblog', icon: Cpu },
  { id: 'lore', icon: FileText },
  { id: 'premium', icon: BookOpen },
  { id: 'roadmap', icon: MapIcon }, 
];

export const themes: Record<CategoryId, ThemeConfig> = {
  all: { className: 'theme-neutral', subtitle: 'Общий Архив', bgImage: 'none' },
  devblog: { className: 'theme-devblog', subtitle: 'Журнал Разработки', bgImage: 'linear-gradient(to right, #06b6d405 1px, transparent 1px), linear-gradient(to bottom, #06b6d405 1px, transparent 1px)' },
  lore: { className: 'theme-lore', subtitle: 'Исторические Справки', bgImage: 'radial-gradient(circle at center, #ffffff05 0%, transparent 70%)' },
  premium: { className: 'theme-premium', subtitle: 'Закрытый Раздел', bgImage: 'radial-gradient(circle at bottom right, #e11d4820 0%, transparent 60%)' },
  roadmap: { className: 'theme-roadmap', subtitle: 'Стратегическая Карта', bgImage: 'linear-gradient(to bottom, #10b98105 1px, transparent 1px)' },
};

// --- Localizations ---
export const translations = {
  ru: {
    systemBooting: 'ЗАГРУЗКА АРХИВА...',
    return: 'К списку',
    edit: 'Ред.',
    accessDenied: 'Доступ Ограничен',
    encrypted: 'Материал засекречен автором.',
    buyKey: 'Получить Доступ',
    secureComms: 'Обсуждение',
    systemOnline: 'Связь стабильна',
    noChapters: 'Архив пуст',
    noData: 'Записи не найдены',
    premium: 'ЗАКРЫТО',
    free: 'ОТКРЫТО',
    chapter: 'ГЛАВА',
    read: 'ЧИТАТЬ',
    enterCode: 'ВВЕСТИ ПАРОЛЬ',
    lockedTitle: 'Секретный Материал',
    lockedDesc: 'Доступ к этой главе ограничен.',
    enterKeyPlaceholder: 'ВВЕДИТЕ ПАРОЛЬ',
    unlock: 'ОТКРЫТЬ',
    whereKey: 'Как получить доступ?',
    subscribe: 'Подписка на Boosty',
    errorKey: 'Пароль не подходит.',
    projectTitle: 'О ПРОЕКТЕ',
    infoBtn: 'ИНФО',
    contactsTitle: 'Связь', 
    vk: 'Сообщество ВКонтакте',
    email: 'Написать на почту',
    supportAuthor: 'ПОДДЕРЖКА ПРОЕКТА',
    supportDesc: 'Создание игры и книги требует ресурсов. Подписка открывает доступ к закрытым материалам архива.',
    rights: '© 2025 Parallel Universe. Все права защищены.',
    poll: 'Опрос',
    imageCaption: 'Изображение',
    roadmapTitle: 'ПЛАН РАБОТ',
    audioPlay: 'ВКЛ. ФОН',
    audioStop: 'ТИШИНА',
    statusDone: 'ВЫПОЛНЕНО',
    statusProgress: 'В РАБОТЕ',
    statusPlanned: 'В ПЛАНАХ',
    gameTitle: 'СЕКРЕТНЫЙ ПОЛИГОН',
    gameOver: 'ТАНК УНИЧТОЖЕН',
    score: 'СЧЕТ',
    restart: 'НОВАЯ ПОПЫТКА',
    controls: 'СТРЕЛКИ - Движение, ПРОБЕЛ - Огонь',
    cats: {
      all: 'Сводка',
      devblog: 'Девблог',
      lore: 'Архив',
      premium: 'Книга',
      roadmap: 'План'
    }
  },
  en: {
    systemBooting: 'LOADING ARCHIVE...',
    return: 'Back',
    edit: 'Edit',
    accessDenied: 'Restricted Access',
    encrypted: 'Material is classified by author.',
    buyKey: 'Get Access',
    secureComms: 'Discussion',
    systemOnline: 'Connection Stable',
    noChapters: 'Archive Empty',
    noData: 'No Records Found',
    premium: 'CLASSIFIED',
    free: 'OPEN',
    chapter: 'CHAPTER',
    read: 'READ',
    enterCode: 'ENTER PASSWORD',
    lockedTitle: 'Restricted Material',
    lockedDesc: 'Access to this chapter is restricted.',
    enterKeyPlaceholder: 'ENTER PASSWORD',
    unlock: 'OPEN',
    whereKey: 'How to get access?',
    subscribe: 'Subscribe on Boosty',
    errorKey: 'Invalid password.',
    projectTitle: 'ABOUT PROJECT',
    infoBtn: 'INFO',
    contactsTitle: 'Contact',
    vk: 'VK Community',
    email: 'Contact via Email',
    supportAuthor: 'SUPPORT PROJECT',
    supportDesc: 'Game and book creation requires resources. Subscription grants access to classified archive materials.',
    rights: '© 2025 Parallel Universe. All rights reserved.',
    poll: 'Poll',
    imageCaption: 'Image',
    roadmapTitle: 'ROADMAP',
    audioPlay: 'PLAY AMBIENT',
    audioStop: 'SILENCE',
    statusDone: 'COMPLETED',
    statusProgress: 'IN PROGRESS',
    statusPlanned: 'PLANNED',
    gameTitle: 'SECRET TESTING GROUND',
    gameOver: 'TANK DESTROYED',
    score: 'SCORE',
    restart: 'RETRY',
    controls: 'ARROWS - Move, SPACE - Fire',
    cats: {
      all: 'Summary',
      devblog: 'Devblog',
      lore: 'Archive',
      premium: 'The Book',
      roadmap: 'Map'
    }
  }
};
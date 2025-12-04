// --- Helper: Parsers ---
export const getEmbedUrl = (url: string) => {
  try {
    if (!url) return '';
    const pollId = url.split('/').pop();
    return `https://strawpoll.com/embed/${pollId}`;
  } catch (e) { return ''; }
};

export const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getRutubeId = (url: string) => {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 1] || parts[parts.length - 2];
};

export const getVkEmbedUrl = (url: string) => {
  if (!url) return null;
  try {
    const match = url.match(/video(-?\d+)_(\d+)/);
    if (match) {
      return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&hd=2`;
    }
    return null;
  } catch { return null; }
};

// Простой форматтер даты
export const formatDate = (d: string, lang: 'ru' | 'en') => d ? new Date(d).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
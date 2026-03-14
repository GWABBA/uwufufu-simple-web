export const isVideoUrl = (url?: string | null) => {
  if (!url) return false;

  return /\.(webm|mp4|mov|m4v|ogg)(\?.*)?$/i.test(url.trim());
};

export const isYouTubeUrl = (url?: string | null) => {
  if (!url) return false;

  const normalized = url.trim();
  if (!normalized) return false;

  try {
    const { hostname } = new URL(normalized);
    const normalizedHost = hostname.replace(/^www\./, '').toLowerCase();

    return (
      normalizedHost === 'youtube.com' ||
      normalizedHost === 'm.youtube.com' ||
      normalizedHost === 'youtu.be' ||
      normalizedHost === 'youtube-nocookie.com'
    );
  } catch {
    return /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(
      normalized
    );
  }
};

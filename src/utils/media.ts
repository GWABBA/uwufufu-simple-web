export const isVideoUrl = (url?: string | null) => {
  if (!url) return false;

  return /\.(webm|mp4|mov|m4v|ogg)(\?.*)?$/i.test(url.trim());
};

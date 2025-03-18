import toast from 'react-hot-toast';

export const shareOnTwitter = (url: string, text: string) => {
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url
  )}&text=${encodeURIComponent(text)}`;
  window.open(twitterUrl, '_blank');
};

export const shareOnReddit = (url: string, title: string) => {
  const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(
    url
  )}&title=${encodeURIComponent(title)}`;
  window.open(redditUrl, '_blank');
};

export const shareOnFacebook = (url: string) => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;
  window.open(facebookUrl, '_blank');
};

export const shareOnWhatsApp = (url: string, text: string) => {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${text} ${url}`
  )}`;
  window.open(whatsappUrl, '_blank');
};

export const shareOnDiscord = (url: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('Copied to clipboard. Share on Discord!');
      })
      .catch(() => {
        toast.error('Failed to copy!');
      });
  } else {
    // Fallback method
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast.success('Copied to clipboard!');
  }
};

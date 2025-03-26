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
      .catch(() => fallbackCopyForDiscord(url));
  } else {
    fallbackCopyForDiscord(url);
  }
};

const fallbackCopyForDiscord = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const success = document.execCommand('copy');
    if (success) toast.success('Copied to clipboard. Share on Discord!');
    else toast.error('Failed to copy!');
  } catch (err) {
    console.error('Fallback copy failed', err);
    toast.error('Copy not supported in this browser.');
  }

  document.body.removeChild(textarea);
};

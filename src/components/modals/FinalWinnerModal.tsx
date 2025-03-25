import { Worldcup } from '@/dtos/worldcup.dtos';
import { Copy, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { StartedGameResponseDto } from '@/dtos/startedGames.dtos';
import { ImageResponse } from '@/dtos/images.dtos';
import toast from 'react-hot-toast';
import { addResultImageToStartedGame } from '@/services/startedGames.service';
import {
  shareOnDiscord as shareOnDiscordService,
  shareOnFacebook as shareOnFacebookService,
  shareOnReddit as shareOnRedditService,
  shareOnTwitter as shareOnTwitterService,
  shareOnWhatsApp as shareOnWhatsAppService,
} from '@/services/share.service';
import { uploadImage } from '@/services/images.service';

interface FinalWinnerModalProps {
  onClose: () => void;
  isOpen: boolean;
  worldcup: Worldcup;
  startedGame: StartedGameResponseDto | null;
  finalStartedGame: StartedGameResponseDto | null;
  finalWinnerId: number;
}

export default function FinalWinnerModal(props: FinalWinnerModalProps) {
  const {
    onClose,
    worldcup,
    startedGame,
    isOpen,
    finalStartedGame,
    finalWinnerId,
  } = props;

  const { t } = useTranslation();
  const [resultUrl, setResultUrl] = useState('');
  const [resultImage, setResultImage] = useState<ImageResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const observer = new MutationObserver(() => {
        const canvas = document.getElementById(
          'finalWinnerCanvas'
        ) as HTMLCanvasElement;
        if (canvas) {
          canvasRef.current = canvas;
          setCanvasReady(true);
          observer.disconnect(); // Stop observing once the canvas is found
        }
      });

      // Observe the modal container for changes
      const modalContainer = document.body;
      observer.observe(modalContainer, { childList: true, subtree: true });

      return () => observer.disconnect(); // Cleanup observer on unmount or modal close
    } else {
      setCanvasReady(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (canvasReady && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && finalStartedGame) {
        // Set canvas dimensions
        const canvasWidth = 1280;
        const canvasHeight = 720;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Fill background
        ctx.fillStyle = '#1e1e2e'; // Cool dark background color
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Load images for selections
        const selection1Image = new window.Image();
        selection1Image.src = `${finalStartedGame.match.selection1.resourceUrl}?canvas=true`;
        selection1Image.crossOrigin = 'anonymous';

        const selection2Image = new window.Image();
        selection2Image.src = `${finalStartedGame.match.selection2.resourceUrl}?canvas=true`;
        selection2Image.crossOrigin = 'anonymous';

        const drawImages = () => {
          const scaleFactor = 1.1; // Slightly enlarge images while keeping aspect ratio

          // Maintain original aspect ratio for both images
          const selection1AspectRatio =
            selection1Image.width / selection1Image.height;
          const selection2AspectRatio =
            selection2Image.width / selection2Image.height;

          let drawWidth1, drawHeight1;
          let drawWidth2, drawHeight2;

          // Scale images but maintain aspect ratio
          if (canvasWidth / canvasHeight > selection1AspectRatio) {
            drawHeight1 = canvasHeight * scaleFactor;
            drawWidth1 = drawHeight1 * selection1AspectRatio;
          } else {
            drawWidth1 = canvasWidth * scaleFactor;
            drawHeight1 = drawWidth1 / selection1AspectRatio;
          }

          if (canvasWidth / canvasHeight > selection2AspectRatio) {
            drawHeight2 = canvasHeight * scaleFactor;
            drawWidth2 = drawHeight2 * selection2AspectRatio;
          } else {
            drawWidth2 = canvasWidth * scaleFactor;
            drawHeight2 = drawWidth2 / selection2AspectRatio;
          }

          // Adjust if scaled dimensions exceed canvas limits
          if (drawWidth1 > canvasWidth) {
            drawWidth1 = canvasWidth;
            drawHeight1 = drawWidth1 / selection1AspectRatio;
          }
          if (drawHeight1 > canvasHeight) {
            drawHeight1 = canvasHeight;
            drawWidth1 = drawHeight1 * selection1AspectRatio;
          }

          if (drawWidth2 > canvasWidth) {
            drawWidth2 = canvasWidth;
            drawHeight2 = drawWidth2 / selection2AspectRatio;
          }
          if (drawHeight2 > canvasHeight) {
            drawHeight2 = canvasHeight;
            drawWidth2 = drawHeight2 * selection2AspectRatio;
          }

          // Keep Modified Horizontal Positions (Only Fix Stretching)
          const drawX1 = canvasWidth * 0.25 - drawWidth1 / 2; // Center Selection 1 at 1/4 width
          const drawX2 = canvasWidth * 0.75 - drawWidth2 / 2; // Center Selection 2 at 3/4 width

          const drawY1 = (canvasHeight - drawHeight1) / 2; // Center vertically
          const drawY2 = (canvasHeight - drawHeight2) / 2; // Center vertically

          // Left image clipping path
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(canvasWidth / 2, 0);
          ctx.lineTo(canvasWidth / 2, canvasHeight);
          ctx.lineTo(0, canvasHeight);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(
            selection1Image,
            drawX1,
            drawY1,
            drawWidth1,
            drawHeight1
          );
          ctx.restore();

          // Right image clipping path
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(canvasWidth, 0);
          ctx.lineTo(canvasWidth / 2, 0);
          ctx.lineTo(canvasWidth / 2, canvasHeight);
          ctx.lineTo(canvasWidth, canvasHeight);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(
            selection2Image,
            drawX2,
            drawY2,
            drawWidth2,
            drawHeight2
          );
          ctx.restore();

          // Draw "VS" text in the center
          ctx.font = 'bold 96px Arial';
          ctx.fillStyle = 'red';
          ctx.textAlign = 'center';
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 12;
          ctx.strokeText('VS', canvasWidth / 2, canvasHeight / 2);
          ctx.fillText('VS', canvasWidth / 2, canvasHeight / 2);

          // Draw winner text on the winning image
          ctx.font = 'bold 72px Arial';
          ctx.fillStyle = 'red';
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 12;
          const isLeftWinner =
            finalWinnerId === finalStartedGame.match.selection1.id;
          const winnerX = isLeftWinner
            ? drawX1 + drawWidth1 / 2
            : drawX2 + drawWidth2 / 2;
          const winnerY = isLeftWinner ? 80 : 700;
          ctx.strokeText('Winner!', winnerX, winnerY);
          ctx.fillText('Winner!', winnerX, winnerY);
        };

        // Draw images once both are loaded (unchanged)
        let imagesLoaded = 0;
        selection1Image.onload = () => {
          imagesLoaded += 1;
          if (imagesLoaded === 2) drawImages();
        };

        selection2Image.onload = () => {
          imagesLoaded += 1;
          if (imagesLoaded === 2) drawImages();
        };
      }
    }
  }, [canvasReady, finalStartedGame, finalWinnerId]);

  useEffect(() => {
    setResultImage(null);
  }, [startedGame, worldcup]);

  useEffect(() => {
    setResultUrl(
      `${window.location.origin}/worldcup/${worldcup.slug}/${startedGame?.startedGame.id}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function shareOnTwitter(url: string, text: string) {
    await saveResultImage();
    shareOnTwitterService(url, text);
  }

  async function shareOnDiscord(url: string) {
    await saveResultImage();
    shareOnDiscordService(url);
  }

  async function shareOnReddit(url: string, title: string) {
    await saveResultImage();
    shareOnRedditService(url, title);
  }

  async function shareOnFacebook(url: string) {
    await saveResultImage();
    shareOnFacebookService(url);
  }

  async function shareOnWhatsApp(url: string, text: string) {
    await saveResultImage();
    shareOnWhatsAppService(url, text);
  }

  const handleOnShareResult = async () => {
    if (isUploading) return; // Prevent multiple concurrent uploads

    setIsUploading(true);

    saveResultImage();

    handleCopy();

    setIsUploading(false);
  };

  const saveCanvasImage = async (): Promise<ImageResponse | null> => {
    const canvas = document.getElementById(
      'finalWinnerCanvas'
    ) as HTMLCanvasElement;

    if (!canvas) {
      console.error('Canvas not found!');
      return null;
    }

    // Convert canvas to a Blob (wrapped in a Promise)
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error('Failed to convert canvas to Blob');
            reject(new Error('Failed to convert canvas to Blob'));
            return;
          }

          // Create a FormData object
          const formData = new FormData();
          formData.append('file', blob, 'final_winner.webp'); // Append the blob as a file
          formData.append('type', 'resultImage');

          try {
            // Upload the image
            const response = await uploadImage(formData);
            resolve(response); // Return ImageResponse
          } catch (error) {
            toast.error('Failed to save image');
            reject(error);
          }
        },
        'image/webp',
        0.8
      ); // Use WebP format with quality 0.8
    });
  };

  const saveResultImage = async () => {
    let imageResponse = resultImage; // Check if an image is already set

    if (!imageResponse) {
      imageResponse = await saveCanvasImage();

      if (imageResponse) {
        setResultImage(imageResponse); // Store to prevent re-upload
        await addResultImageToStartedGame({
          startedGameId: startedGame!.startedGame.id!,
          imageUrl: imageResponse.url,
        });
      }
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(resultUrl)
        .then(() => toast.success('Copied to clipboard!'))
        .catch(() => fallbackCopy(resultUrl));
    } else {
      fallbackCopy(resultUrl);
    }
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Avoid scrolling to bottom
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const success = document.execCommand('copy');
      if (success) {
        toast.success('Copied to clipboard!');
      } else {
        toast.error('Failed to copy!');
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
      toast.error('Copy not supported in this browser.');
    }

    document.body.removeChild(textarea);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="w-full max-w-[480px] h-full max-h-[600px] bg-uwu-black text-white p-4 relative rounded-md">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-white"
        >
          <X size={30} />
        </button>
        <h1 className="text-center text-uwu-red text-xl md:text-2xl mb-4">
          {t('worldcup.share-final-winner')}
        </h1>
        <h4 className="text-lg md:text-xl font-bold mb-2">{worldcup.title}</h4>
        <div className="w-full aspect-video bg-red-300 rounded-md relative mb-4">
          <canvas
            id="finalWinnerCanvas"
            className="w-full h-full rounded-md"
          ></canvas>
        </div>
        {/* Copy link */}
        <div
          className="flex cursor-pointer"
          onClick={handleOnShareResult} // ✅ Clicking anywhere copies the link
        >
          <div className="p-2 pl-4 pr-8 w-full rounded-l-md bg-uwu-dark-gray text-white outline-none h-10 cursor-pointer flex items-center whitespace-nowrap overflow-x-scroll scrollbar-hide">
            {resultUrl}
          </div>
          <button className="h-10 w-14 bg-uwu-red rounded-r-md flex justify-center items-center">
            <Copy size={20} />
          </button>
        </div>
        {/* share */}
        <div className="flex justify-evenly mt-4">
          {/* discord */}
          <button
            className="w-12 h-12 bg-[#5865F2] rounded-full flex justify-center items-center"
            onClick={() => shareOnDiscord(resultUrl)}
          >
            <Image
              src="/assets/social-medias/share_discord.svg"
              alt="discord"
              width={24}
              height={24}
            />
          </button>
          {/* reddit */}
          <button
            className="w-12 h-12 bg-[#FF4500] rounded-full flex justify-center items-center"
            onClick={() =>
              shareOnReddit(
                resultUrl,
                `#uwufufu ${worldcup.title} 🔥 ${worldcup.description}`
              )
            }
          >
            <Image
              src="/assets/social-medias/share_reddit.svg"
              alt="Reddit"
              width={24}
              height={24}
            />
          </button>
          {/* twitter */}
          <button
            className="w-12 h-12 bg-[#1DA1F2] rounded-full flex justify-center items-center"
            onClick={() =>
              shareOnTwitter(
                resultUrl,
                `#uwufufu ${worldcup.title} 🔥 ${worldcup.description}`
              )
            }
          >
            <Image
              src="/assets/social-medias/share_twitter.svg"
              alt="Whatsapp"
              width={24}
              height={24}
            />
          </button>
          {/* facebook */}
          <button
            className="w-12 h-12 bg-[#1877F2] rounded-full flex justify-center items-center"
            onClick={() => shareOnFacebook(resultUrl)}
          >
            <Image
              src="/assets/social-medias/share_facebook.svg"
              alt="Whatsapp"
              width={14}
              height={14}
            />
          </button>
          {/* whatsapp */}
          <button
            className="w-12 h-12 bg-[#25D366] rounded-full flex justify-center items-center"
            onClick={() =>
              shareOnWhatsApp(
                resultUrl,
                `#uwufufu ${worldcup.title} 🔥 ${worldcup.description}`
              )
            }
          >
            <Image
              src="/assets/social-medias/share_whatsapp.svg"
              alt="Whatsapp"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

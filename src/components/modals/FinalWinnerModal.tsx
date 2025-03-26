import { Worldcup } from '@/dtos/worldcup.dtos';
import { Copy, Download, RefreshCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import Animation1Canvas, {
  Animation1CanvasHandle,
} from '@/components/result-animation/Animation1Canvas';

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
  const [animationKey, setAnimationKey] = useState(0);
  const canvasRef = useRef<Animation1CanvasHandle>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    setResultImage(null);
  }, [startedGame, worldcup]);

  useEffect(() => {
    setResultUrl(
      `${window.location.origin}/worldcup/${worldcup.slug}/${startedGame?.startedGame.id}`
    );
  }, [worldcup.slug, startedGame]);

  const saveCanvasImage = async (): Promise<ImageResponse | null> => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) {
      console.error('Canvas not found!');
      return null;
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob: Blob | null) => {
          if (!blob) {
            console.error('Failed to convert canvas to Blob');
            reject(new Error('Failed to convert canvas to Blob'));
            return;
          }

          const formData = new FormData();
          formData.append('file', blob, 'final_winner.webp');
          formData.append('type', 'resultImage');

          try {
            const response = await uploadImage(formData);
            resolve(response);
          } catch (error) {
            toast.error('Failed to save image');
            reject(error);
          }
        },
        'image/webp',
        0.8
      );
    });
  };

  const saveResultImage = async () => {
    let imageResponse = resultImage;
    if (!imageResponse) {
      imageResponse = await saveCanvasImage();
      if (imageResponse) {
        setResultImage(imageResponse);
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
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const success = document.execCommand('copy');
      if (success) toast.success('Copied to clipboard!');
      else toast.error('Failed to copy!');
    } catch (err) {
      console.error('Fallback copy failed', err);
      toast.error('Copy not supported in this browser.');
    }

    document.body.removeChild(textarea);
  };

  const handleReshowAnimation = () => {
    setAnimationKey((prev) => prev + 1);
  };

  const handleOnShareResult = async () => {
    if (!videoUrl || isUploading) {
      toast.error('Please wait for the animation to finish!');
      return;
    }

    if (isUploading) return;
    setIsUploading(true);
    await saveResultImage();
    handleCopy();
    setIsUploading(false);
  };

  async function shareOnTwitter(url: string, text: string) {
    if (!videoUrl || isUploading) {
      toast.error('Please wait for the animation to finish!');
      return;
    }

    await saveResultImage();
    shareOnTwitterService(url, text);
  }
  async function shareOnDiscord(url: string) {
    if (!videoUrl || isUploading) {
      toast.error('Please wait for the animation to finish!');
      return;
    }

    await saveResultImage();
    shareOnDiscordService(url);
  }
  async function shareOnReddit(url: string, title: string) {
    if (!videoUrl || isUploading) {
      toast.error('Please wait for the animation to finish!');
      return;
    }

    await saveResultImage();
    shareOnRedditService(url, title);
  }
  async function shareOnFacebook(url: string) {
    if (!videoUrl || isUploading) {
      toast.error('Please wait for the animation to finish!');
      return;
    }

    await saveResultImage();
    shareOnFacebookService(url);
  }
  async function shareOnWhatsApp(url: string, text: string) {
    if (!videoUrl || isUploading) {
      toast.error('Please wait for the animation to finish!');
      return;
    }

    await saveResultImage();
    shareOnWhatsAppService(url, text);
  }

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;

    const stream = canvas.captureStream(60); // 60fps
    streamRef.current = stream;

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recordedChunks.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };

    mediaRecorder.current = recorder;
    recorder.start();
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  if (!isOpen || !finalStartedGame) return null;

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

        {/* canvas */}
        <div className="w-full aspect-video rounded-md relative mb-4">
          <Animation1Canvas
            key={animationKey}
            ref={canvasRef}
            worldcup={worldcup}
            finalStartedGame={finalStartedGame}
            finalWinnerId={finalWinnerId}
            onAnimationStart={startRecording}
            onAnimationEnd={stopRecording}
          />
          <button
            onClick={handleReshowAnimation}
            disabled={!videoUrl || isUploading}
            className={`absolute bottom-2 right-2 p-2 rounded-full z-10 transition-opacity ${
              !videoUrl || isUploading
                ? 'bg-uwu-red opacity-50 cursor-not-allowed'
                : 'bg-uwu-red'
            }`}
            title="Replay animation"
          >
            <RefreshCcw size={16} />
          </button>

          <button
            onClick={() => {
              if (!videoUrl) return;
              const a = document.createElement('a');
              a.href = videoUrl;
              a.download = 'uwufufu-animation.webm';
              a.click();
            }}
            disabled={!videoUrl}
            className={`absolute bottom-2 right-12 bg-uwu-red text-white p-2 rounded-full z-10 transition-opacity ${
              !videoUrl ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Download animation"
          >
            <Download size={16} />
          </button>
        </div>
        <div
          className={`flex ${
            !videoUrl || isUploading
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
          onClick={() => {
            if (!videoUrl || isUploading) return;
            handleOnShareResult();
          }}
        >
          <div className="p-2 pl-4 pr-8 w-full rounded-l-md bg-uwu-dark-gray text-white outline-none h-10 flex items-center whitespace-nowrap overflow-x-scroll scrollbar-hide">
            {resultUrl}
          </div>
          <button
            className="h-10 w-14 bg-uwu-red rounded-r-md flex justify-center items-center"
            disabled={!videoUrl || isUploading}
          >
            <Copy size={20} />
          </button>
        </div>

        <div className="flex justify-evenly mt-4">
          <button
            className={`w-12 h-12 bg-[#5865F2] rounded-full flex justify-center items-center ${
              !videoUrl || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!videoUrl || isUploading}
            onClick={() => shareOnDiscord(resultUrl)}
          >
            <Image
              src="/assets/social-medias/share_discord.svg"
              alt="discord"
              width={24}
              height={24}
            />
          </button>
          <button
            className={`w-12 h-12 bg-[#FF4500] rounded-full flex justify-center items-center ${
              !videoUrl || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!videoUrl || isUploading}
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
          <button
            className={`w-12 h-12 bg-[#1DA1F2] rounded-full flex justify-center items-center ${
              !videoUrl || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!videoUrl || isUploading}
            onClick={() =>
              shareOnTwitter(
                resultUrl,
                `#uwufufu ${worldcup.title} 🔥 ${worldcup.description}`
              )
            }
          >
            <Image
              src="/assets/social-medias/share_twitter.svg"
              alt="Twitter"
              width={24}
              height={24}
            />
          </button>
          <button
            className={`w-12 h-12 bg-[#1877F2] rounded-full flex justify-center items-center ${
              !videoUrl || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!videoUrl || isUploading}
            onClick={() => shareOnFacebook(resultUrl)}
          >
            <Image
              src="/assets/social-medias/share_facebook.svg"
              alt="Facebook"
              width={14}
              height={14}
            />
          </button>
          <button
            className={`w-12 h-12 bg-[#25D366] rounded-full flex justify-center items-center ${
              !videoUrl || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!videoUrl || isUploading}
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

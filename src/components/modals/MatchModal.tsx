import React, { useState, useEffect, useRef } from 'react';
import { Selection, StartedGameResponseDto } from '@/dtos/startedGames.dtos';
import Image from 'next/image';
import ChevronLeft from '@/../public/assets/icons/chevron-left.svg';
import MagnifyingPlus from '@/../public/assets/icons/magnifying-plus.svg';
import { Worldcup } from '@/dtos/worldcup.dtos';
import { Copy, X } from 'lucide-react';
import { uploadImage } from '@/services/images.service';
import toast from 'react-hot-toast';
import { ImageResponse } from '@/dtos/images.dtos';
import { addResultImageToStartedGame } from '@/services/startedGames.service';
import {
  shareOnDiscord as shareOnDiscordService,
  shareOnFacebook as shareOnFacebookService,
  shareOnReddit as shareOnRedditService,
  shareOnTwitter as shareOnTwitterService,
  shareOnWhatsApp as shareOnWhatsAppService,
} from '@/services/share.service';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface MatchModalProps {
  isOpen: boolean;
  startedGame: StartedGameResponseDto | null;
  worldcup: Worldcup;
  onClose: () => void; // Function to close the modal
  onSelect: (selection: Selection) => void; // Callback for selection
}

const MatchModal: React.FC<MatchModalProps> = ({
  isOpen,
  startedGame,
  worldcup,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // const [isLoaded, setIsLoaded] = useState(false);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [selected, setSelected] = useState<boolean>(false);
  const [selectDisabled, setSelectDisabled] = useState<boolean>(false);
  const [fullSizeMedia, setFullSizeMedia] = useState<Selection | null>(null);
  const [finalStartedGame, setFinalStartedGame] =
    useState<StartedGameResponseDto | null>(null);
  const [finalWinnerId, setFinalWinnerId] = useState<number | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [resultImage, setResultImage] = useState<ImageResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setResultUrl(
      `${window.location.origin}/worldcup/${worldcup.slug}/${startedGame?.startedGame.id}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!startedGame || !startedGame.match) return;
    if (startedGame.match.roundsOf === 2) {
      setFinalStartedGame(startedGame);
    }
  }, [startedGame]);

  const handleOnSelect = (selection: Selection) => {
    if (startedGame && startedGame.match && startedGame.match.roundsOf) {
      setFinalWinnerId(selection.id);
    }
    if (selectDisabled) return;
    setSelectDisabled(true);
    setWinnerId(selection.id);
    setSelected(true);
    setTimeout(async () => {
      setSelected(false);
      await onSelect(selection);
      setSelectDisabled(false);
    }, 1000); // Add delay for visual effect
  };

  const handleOnClickMagnify = (
    event: React.MouseEvent<HTMLDivElement>,
    selection: Selection
  ) => {
    event.stopPropagation();
    setFullSizeMedia(selection); // Open full-size modal
  };

  const handleFullSizeClose = () => {
    setFullSizeMedia(null); // Close full-size modal
  };

  useEffect(() => {
    // Reset selection states when a new match starts
    setWinnerId(null);
    setSelected(false);
    setSelectDisabled(false);
  }, [startedGame]);

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

  const handleOnShareResult = async () => {
    if (isUploading) return; // Prevent multiple concurrent uploads

    setIsUploading(true);

    saveResultImage();

    handleCopy();

    setIsUploading(false);
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
        .then(() => {
          toast.success('Copied to clipboard!');
        })
        .catch(() => {
          toast.error('Failed to copy!');
        });
    } else {
      // Fallback method
      const textarea = document.createElement('textarea');
      textarea.value = resultUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Copied to clipboard!');
    }
  };

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

  if (!isOpen) return null;

  return (
    <>
      {startedGame && startedGame.startedGame.status !== 'IS_COMPLETED' ? (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="relative w-full h-full max-h-screen overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-uwu-black text-white flex justify-between items-center md:h-16">
              <h2
                onClick={onClose}
                className="text-base md:text-xl font-bold flex items-center"
              >
                <ChevronLeft className="w-3 h-3 md:w-6 md:h-6 mr-1" />
                Back
              </h2>
            </div>

            {/* Matches */}
            <div
              className="overflow-y-auto p-4 bg-uwu-black relative"
              style={{
                height: `calc(100vh - 4rem)`, // 4rem accounts for the header
              }}
            >
              <div className="absolute inset-0 flex justify-center text-white">
                <div className="text-center">
                  <h1 className="text-base md:text-3xl font-bold">
                    {worldcup.title}
                  </h1>
                  <p className="text-gray-400">{worldcup.description}</p>
                  <p className="text-xl font-bold">
                    {t('worldcup.rounds-of', {
                      round: startedGame.match.roundsOf,
                      match: startedGame.matchNumberInRound,
                    })}
                  </p>
                </div>
              </div>
              <div className="max-w-7xl mx-auto h-full">
                <div
                  key={startedGame.match.id}
                  className="flex flex-col md:flex-row justify-between items-center p-4 md:gap-4 h-full pt-28 md:pt-4 relative"
                >
                  {/* <span className="hidden md:block absolute left-1/2 top-[65%] md:top-1/2 transform -translate-x-1/2 md:-translate-y-1/2 text-white md:text-7xl font-extrabold drop-shadow-lg pointer-events-none z-20 select-none">
                    VS
                  </span> */}
                  {!winnerId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, x: '-50%' }} // <- this replaces -translate-x-1/2
                      exit={{ opacity: 0, scale: 0.6 }}
                      className="hidden md:block absolute left-1/2 top-[40%] 
                        text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r 
                        from-blue-500 to-uwu-red drop-shadow-2xl z-30 select-none"
                    >
                      VS
                    </motion.div>
                  )}

                  {/* First Selection */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      winnerId
                        ? winnerId === startedGame.match.selection1.id
                          ? { scale: 1.1 } // Winner slightly enlarges
                          : {
                              rotate: 20,
                              scale: 0,
                              opacity: 0,
                              transition: { duration: 0.6 },
                            } // Loser gets "destroyed"
                        : { opacity: 1 }
                    }
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    onClick={() => handleOnSelect(startedGame.match.selection1)}
                    className="w-full md:w-1/2 cursor-pointer flex flex-col items-center relative"
                  >
                    {winnerId && selected && (
                      <div
                        className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 rounded text-white font-bold text-xl ${
                          winnerId === startedGame.match.selection1.id
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      >
                        {winnerId === startedGame.match.selection1.id
                          ? t('worldcup.win')
                          : t('worldcup.lose')}
                      </div>
                    )}
                    <div className="w-full max-h-[50vh] overflow-hidden relative rounded-2xl">
                      <div
                        className="w-12 h-12 absolute top-1 left-1 md:top-5 md:left-5 rounded-full bg-gray-900 flex justify-center items-center"
                        onClick={(event) =>
                          handleOnClickMagnify(
                            event,
                            startedGame.match.selection1
                          )
                        }
                      >
                        <MagnifyingPlus className="text-white" />
                      </div>
                      {startedGame.match.selection1.isVideo ? (
                        <div className="w-full aspect-video">
                          <iframe
                            className="rounded mx-auto w-full h-full object-contain"
                            src={
                              startedGame.match.selection1.videoUrl.includes(
                                'youtu.be'
                              )
                                ? startedGame.match.selection1.videoUrl.replace(
                                    'youtu.be',
                                    'www.youtube.com/embed'
                                  )
                                : startedGame.match.selection1.videoUrl.replace(
                                    'watch?v=',
                                    'embed/'
                                  )
                            }
                            allowFullScreen
                            style={{
                              // width: '100%',
                              border: 'none',
                            }}
                          ></iframe>
                        </div>
                      ) : (
                        <Image
                          className="rounded mx-auto"
                          src={startedGame.match.selection1.resourceUrl}
                          alt={startedGame.match.selection1.name}
                          width={800}
                          height={800}
                          style={{
                            objectFit: 'contain',
                            maxWidth: '100%',
                            maxHeight: '70vh',
                          }}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-center p-0.5 md:p-2 bg-blue-500 text-white rounded mt-2 w-full text-center text-sm md:text-base min-h-14">
                      {startedGame.match.selection1.name}
                    </div>
                  </motion.div>

                  {!winnerId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      className="md:hidden flex justify-center items-center w-full text-5xl font-black 
                      text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-uwu-red
                      drop-shadow-xl z-30 select-none py-2"
                    >
                      VS
                    </motion.div>
                  )}

                  {/* Second Selection */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      winnerId
                        ? winnerId === startedGame.match.selection2.id
                          ? { scale: 1.1 } // Winner slightly enlarges
                          : {
                              rotate: -20,
                              scale: 0,
                              opacity: 0,
                              transition: { duration: 0.6 },
                            } // Loser gets "destroyed"
                        : { opacity: 1 }
                    }
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    onClick={() => handleOnSelect(startedGame.match.selection2)}
                    className="w-full md:w-1/2 cursor-pointer flex flex-col items-center relative"
                  >
                    <div
                      className="w-12 h-12 absolute top-1 right-1 md:top-5 md:right-5 rounded-full bg-gray-900 flex justify-center items-center"
                      onClick={(event) =>
                        handleOnClickMagnify(
                          event,
                          startedGame.match.selection2
                        )
                      }
                    >
                      <MagnifyingPlus className="text-white" />
                    </div>
                    {/* Win/Lose Label */}
                    {winnerId && selected && (
                      <div
                        className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 rounded text-white font-bold text-xl ${
                          winnerId === startedGame.match.selection2.id
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      >
                        {winnerId === startedGame.match.selection2.id
                          ? t('worldcup.win')
                          : t('worldcup.lose')}
                      </div>
                    )}
                    <div className="w-full max-h-[50vh] overflow-hidden rounded-2xl">
                      {startedGame.match.selection2.isVideo ? (
                        <div className="w-full aspect-video">
                          <iframe
                            className="rounded mx-auto w-full h-full object-contain"
                            src={
                              startedGame.match.selection2.videoUrl.includes(
                                'youtu.be'
                              )
                                ? startedGame.match.selection2.videoUrl.replace(
                                    'youtu.be',
                                    'www.youtube.com/embed'
                                  )
                                : startedGame.match.selection2.videoUrl.replace(
                                    'watch?v=',
                                    'embed/'
                                  )
                            }
                            allowFullScreen
                            style={{
                              // width: '100%',
                              border: 'none',
                            }}
                          ></iframe>
                        </div>
                      ) : (
                        <Image
                          className="rounded mx-auto"
                          src={startedGame.match.selection2.resourceUrl}
                          alt={startedGame.match.selection2.name}
                          width={800}
                          height={800}
                          style={{
                            objectFit: 'contain',
                            maxWidth: '100%',
                            maxHeight: '70vh',
                          }}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-center p-0.5 md:p-2 bg-red-500 text-white rounded mt-2 w-full text-sm md:text-base min-h-14">
                      {startedGame.match.selection2.name}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Final Winner Modal
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
            <h4 className="text-lg md:text-xl font-bold mb-2">
              {worldcup.title}
            </h4>
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
      )}

      {/* Full-Size Modal */}
      {fullSizeMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 w-screen h-screen"
          onClick={handleFullSizeClose}
        >
          {fullSizeMedia.isVideo ? (
            <div className="w-full aspect-video">
              <iframe
                className="w-full h-full"
                src={
                  fullSizeMedia.videoUrl.includes('youtu.be')
                    ? fullSizeMedia.videoUrl.replace(
                        'youtu.be',
                        'www.youtube.com/embed'
                      )
                    : fullSizeMedia.videoUrl.replace('watch?v=', 'embed/')
                }
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <Image
              src={fullSizeMedia.resourceUrl}
              alt={fullSizeMedia.name}
              width={1920}
              height={1080}
              className="max-w-full max-h-full object-contain"
              // style={{ objectFit: 'contain' }}
            />
          )}
        </div>
      )}
    </>
  );
};

export default MatchModal;

import React, { useState, useEffect, useRef } from 'react';
import { Selection, StartedGameResponseDto } from '@/dtos/startedGames.dtos';
import Image from 'next/image';
import ChevronLeft from '@/assets/icons/chevron-left.svg';
import MagnifyingPlus from '@/assets/icons/magnifying-plus.svg';
import { Worldcup } from '@/dtos/worldcup.dtos';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import FinalWinnerModal from './FinalWinnerModal';
import { useAppSelector } from '@/store/hooks';
import GoogleAd from '../common/GoogleAd';
import { isYouTubeUrl } from '@/utils/media';

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface MatchModalProps {
  isOpen: boolean;
  startedGame: StartedGameResponseDto | null;
  worldcup: Worldcup;
  onClose: () => void;
  onSelect: (selection: Selection) => void;
}

const MatchModal: React.FC<MatchModalProps> = ({
  isOpen,
  startedGame,
  worldcup,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();

  const hasValidMediaUrl = (url?: string | null) => {
    if (!url) return false;
    const normalized = url.trim();
    return (
      normalized.startsWith('http://') ||
      normalized.startsWith('https://') ||
      normalized.startsWith('/')
    );
  };

  const isYouTubeSelection = (selection: Selection) =>
    hasValidMediaUrl(selection.videoUrl) &&
    (selection.videoSource === 'youtube' || isYouTubeUrl(selection.videoUrl));

  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [selected, setSelected] = useState<boolean>(false);
  const [selectDisabled, setSelectDisabled] = useState<boolean>(false);
  const [fullSizeMedia, setFullSizeMedia] = useState<Selection | null>(null);
  const [finalStartedGame, setFinalStartedGame] =
    useState<StartedGameResponseDto | null>(null);
  const [finalWinnerId, setFinalWinnerId] = useState<number | null>(null);

  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!startedGame || !startedGame.match) return;
    if (startedGame.match.roundsOf === 2) {
      setFinalStartedGame(startedGame);
    }
  }, [startedGame]);

  const handleOnSelect = (selection: Selection) => {
    if (!startedGame?.match || selectDisabled) return;

    if (startedGame.match.roundsOf) {
      setFinalWinnerId(selection.id);
    }

    setSelectDisabled(true);
    setWinnerId(selection.id);
    setSelected(true);

    setTimeout(async () => {
      setSelected(false);
      await onSelect(selection);
      setSelectDisabled(false);
    }, 1000);
  };

  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOnClickMagnify = (
    event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    selection: Selection,
  ) => {
    event.stopPropagation();
    setFullSizeMedia(selection);
  };

  const handleFullSizeClose = () => {
    setFullSizeMedia(null);
  };

  useEffect(() => {
    if (!fullSizeMedia) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullSizeMedia(null);
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [fullSizeMedia]);

  const getYouTubeEmbedUrl = (
    url: string,
    startTime: number = 0,
    endTime: number = 0,
  ) => {
    const embedUrl = url.includes('youtu.be')
      ? url.replace('youtu.be/', 'www.youtube.com/embed/')
      : url.replace('watch?v=', 'embed/');

    const params = new URLSearchParams({
      enablejsapi: '1',
      start: startTime.toString(),
      end: endTime.toString(),
      rel: '0',
      autoplay: '0',
    });

    return `${embedUrl}?${params.toString()}`;
  };

  const playerRefs = useRef<Record<string, YT.Player>>({});
  const ytApiLoadingRef = useRef(false);

  const loadYouTubeAPI = () => {
    return new Promise<void>((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]',
      );

      if (!existingScript && !ytApiLoadingRef.current) {
        ytApiLoadingRef.current = true;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag?.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.body.appendChild(tag);
        }
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousCallback === 'function') {
          previousCallback();
        }
        resolve();
      };
    });
  };

  const initPlayer = async (iframeId: string) => {
    await loadYouTubeAPI();

    if (!playerRefs.current[iframeId]) {
      const player = new YT.Player(iframeId, {
        events: {
          onReady: () => {
            playerRefs.current[iframeId] = player;
            player.mute();
            player.playVideo();
          },
        },
      });
    } else {
      playerRefs.current[iframeId].playVideo();
    }
  };

  const pausePlayer = (iframeId: string) => {
    const player = playerRefs.current[iframeId];
    if (player?.pauseVideo) {
      player.pauseVideo();
    }
  };

  useEffect(() => {
    setWinnerId(null);
    setSelected(false);
    setSelectDisabled(false);
  }, [startedGame]);

  if (!isOpen) return null;

  const renderSelection = ({
    selection,
    side,
  }: {
    selection: Selection;
    side: 'left' | 'right';
  }) => {
    const isWinner = winnerId === selection.id;
    const hasWinner = winnerId !== null;

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={
          hasWinner
            ? isWinner
              ? { scale: 1.04 }
              : {
                  rotate: side === 'left' ? 20 : -20,
                  scale: 0,
                  opacity: 0,
                  transition: { duration: 0.6 },
                }
            : { opacity: 1 }
        }
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        onClick={() => handleOnSelect(selection)}
        className="w-full md:w-1/2 cursor-pointer flex flex-col items-center relative"
      >
        {hasWinner && selected && (
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded text-white font-bold text-base md:text-xl ${
              isWinner ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {isWinner ? t('worldcup.win') : t('worldcup.lose')}
          </div>
        )}

        <div className="relative w-full rounded-2xl overflow-hidden bg-black">
          <button
            type="button"
            aria-label="View full image"
            className="absolute top-3 right-3 z-20 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:scale-105"
            onClick={(event) => handleOnClickMagnify(event, selection)}
          >
            <MagnifyingPlus className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {selection.isVideo && isYouTubeSelection(selection) ? (
            <div className="w-full aspect-video bg-black">
              <iframe
                id={`ytplayer-${selection.id}`}
                src={getYouTubeEmbedUrl(
                  selection.videoUrl,
                  selection.startTime,
                  selection.endTime,
                )}
                className="rounded mx-auto w-full h-full object-contain"
                allowFullScreen
                style={{ border: 'none' }}
                onMouseEnter={() => initPlayer(`ytplayer-${selection.id}`)}
                onMouseLeave={() => pausePlayer(`ytplayer-${selection.id}`)}
              />
            </div>
          ) : selection.isVideo && hasValidMediaUrl(selection.resourceUrl) ? (
            <div className="w-full aspect-video bg-black">
              <video
                src={selection.resourceUrl}
                className="rounded mx-auto w-full h-full object-contain"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
              />
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-full h-[34vh] sm:h-[38vh] md:h-[60vh] bg-black overflow-hidden">
              <Image
                src={selection.resourceUrl}
                alt={selection.name}
                width={1600}
                height={1600}
                className="max-w-full max-h-full w-auto h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          )}
        </div>

        <div
          className={`flex items-center justify-center p-2 md:p-3 text-white rounded mt-2 w-full text-center text-sm md:text-base min-h-14 font-semibold ${
            side === 'left' ? 'bg-blue-500' : 'bg-red-500'
          }`}
        >
          {selection.name}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {startedGame && startedGame.startedGame.status !== 'IS_COMPLETED' ? (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="relative w-full max-h-screen overflow-scroll">
            {/* google adsense uwufufu-quiz-play-bottom-desktop */}
            {/* <div className="hidden md:block bg-uwu-black">
              {(!user || user.tier === 'basic') &&
                worldcup?.isNsfw === false && (
                  <div className="w-full flex justify-center">
                    <div className="max-w-5xl w-full px-2">
                      <GoogleAd adSlot="9330666892" />
                    </div>
                  </div>
                )}
            </div> */}

            <div className="p-4 bg-uwu-black text-white flex justify-between items-center md:h-16">
              <h2
                onClick={onClose}
                className="text-base md:text-xl font-bold flex items-center cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3 md:w-6 md:h-6 mr-1" />
                Back
              </h2>
            </div>

            <div
              className="overflow-y-auto p-4 bg-uwu-black relative"
              style={{
                height: `${viewportHeight - 64}px`,
              }}
            >
              <div className="absolute inset-x-0 top-0 flex justify-center text-white px-4 pointer-events-none">
                <div className="text-center pt-2">
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

              <div className="max-w-7xl mx-auto md:h-full">
                <div
                  key={startedGame.match.id}
                  className="flex flex-col md:flex-row justify-between items-center p-4 md:gap-6 h-full pt-28 md:pt-6 relative"
                >
                  {!winnerId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, x: '-50%' }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      className="hidden md:block absolute left-1/2 top-[42%] text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-uwu-red drop-shadow-2xl z-30 select-none"
                    >
                      VS
                    </motion.div>
                  )}

                  {renderSelection({
                    selection: startedGame.match.selection1,
                    side: 'left',
                  })}

                  {!winnerId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      className="md:hidden flex justify-center items-center w-full text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-uwu-red drop-shadow-xl z-30 select-none py-3"
                    >
                      VS
                    </motion.div>
                  )}

                  {renderSelection({
                    selection: startedGame.match.selection2,
                    side: 'right',
                  })}
                </div>
              </div>

              {/* google adsense uwufufu-quiz-play-bottom-mobile */}
              {/* <div className="md:hidden">
                {(!user || user.tier === 'basic') &&
                  worldcup?.isNsfw === false && (
                    <div className="mt-6 w-full flex justify-center">
                      <div className="max-w-5xl w-full px-2">
                        <GoogleAd adSlot="9732284311" />
                      </div>
                    </div>
                  )}
              </div> */}
            </div>
          </div>
        </div>
      ) : (
        <FinalWinnerModal
          onClose={onClose}
          isOpen={isOpen}
          worldcup={worldcup}
          startedGame={startedGame}
          finalStartedGame={finalStartedGame}
          finalWinnerId={finalWinnerId!}
        />
      )}

      {fullSizeMedia && (
        <div
          className="fixed inset-0 z-[60] flex h-screen w-screen items-center justify-center bg-black/90 p-4"
          onClick={handleFullSizeClose}
        >
          <button
            type="button"
            aria-label="Close full screen media"
            onClick={handleFullSizeClose}
            className="absolute right-4 top-4 z-[70] flex h-16 w-16 items-center justify-center rounded-full bg-black/75 text-white text-5xl leading-none backdrop-blur-sm transition hover:scale-105 md:right-6 md:top-6 md:h-20 md:w-20 md:text-6xl"
          >
            ×
          </button>

          {fullSizeMedia && (
            <div
              className="fixed inset-0 z-[60] flex h-screen w-screen items-center justify-center bg-black/90 p-4"
              onClick={handleFullSizeClose}
            >
              <button
                type="button"
                aria-label="Close full screen media"
                onClick={handleFullSizeClose}
                className="absolute right-4 top-4 z-[70] flex h-16 w-16 items-center justify-center rounded-full bg-black/75 text-white text-5xl leading-none backdrop-blur-sm transition hover:scale-105 md:right-6 md:top-6 md:h-20 md:w-20 md:text-6xl"
              >
                ×
              </button>

              {fullSizeMedia.isVideo && isYouTubeSelection(fullSizeMedia) ? (
                <div className="flex w-full items-center justify-center">
                  <div className="aspect-video w-full max-w-[960px] overflow-hidden rounded-xl bg-black">
                    <iframe
                      className="h-full w-full"
                      src={
                        fullSizeMedia.videoUrl.includes('youtu.be')
                          ? fullSizeMedia.videoUrl.replace(
                              'youtu.be/',
                              'www.youtube.com/embed/',
                            )
                          : fullSizeMedia.videoUrl.replace('watch?v=', 'embed/')
                      }
                      allowFullScreen
                      style={{ border: 'none' }}
                    />
                  </div>
                </div>
              ) : fullSizeMedia.isVideo &&
                hasValidMediaUrl(fullSizeMedia.resourceUrl) ? (
                <div className="flex w-full items-center justify-center">
                  <video
                    className="max-h-full max-w-full rounded-xl"
                    src={fullSizeMedia.resourceUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                  />
                </div>
              ) : (
                <div className="relative flex h-full w-full items-center justify-center">
                  <Image
                    src={fullSizeMedia.resourceUrl}
                    alt={fullSizeMedia.name}
                    width={2200}
                    height={2200}
                    className="max-h-full max-w-full h-auto w-auto object-contain"
                    sizes="100vw"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MatchModal;

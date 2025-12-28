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
// import { useAppSelector } from '@/store/hooks';
// import GoogleAd from '../common/GoogleAd';

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

  // const [isLoaded, setIsLoaded] = useState(false);
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

  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateHeight(); // Set on mount

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

    // Cleanup when modal unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  const getYouTubeEmbedUrl = (
    url: string,
    startTime: number = 0,
    endTime: number = 0
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

  // const handleVideoControl = (
  //   iframeId: string,
  //   command: 'playVideo' | 'pauseVideo'
  // ) => {
  //   const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
  //   if (!iframe) return;

  //   iframe.contentWindow?.postMessage(
  //     JSON.stringify({
  //       event: 'command',
  //       func: command,
  //       args: [],
  //     }),
  //     '*'
  //   );
  // };

  const playerRefs = useRef<Record<string, YT.Player>>({});

  const initPlayer = async (iframeId: string) => {
    await loadYouTubeAPI();

    if (!playerRefs.current[iframeId]) {
      const player = new YT.Player(iframeId, {
        events: {
          onReady: () => {
            playerRefs.current[iframeId] = player;
            player.mute(); // Optional: mute on first load
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
    if (player && player.pauseVideo) {
      player.pauseVideo();
    }
  };

  const loadYouTubeAPI = () => {
    return new Promise<void>((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
      } else {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Set global callback for API ready
        window.onYouTubeIframeAPIReady = () => resolve();
      }
    });
  };

  useEffect(() => {
    // Reset selection states when a new match starts
    setWinnerId(null);
    setSelected(false);
    setSelectDisabled(false);
  }, [startedGame]);

  if (!isOpen) return null;

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
                height: `${viewportHeight - 64}px`, // 4rem accounts for the header
              }}
            >
              {/* header */}
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
              {/* match  */}
              <div className="max-w-7xl mx-auto md:h-[100%]">
                <div
                  key={startedGame.match.id}
                  className="flex flex-col md:flex-row justify-between items-center p-4 md:gap-4 h-full pt-28 md:pt-4 relative"
                >
                  {/* vs text for desktop */}
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
                            id={`ytplayer-${startedGame.match.selection1.id}`}
                            src={getYouTubeEmbedUrl(
                              startedGame.match.selection1.videoUrl,
                              startedGame.match.selection1.startTime,
                              startedGame.match.selection1.endTime
                            )}
                            className="rounded mx-auto w-full h-full object-contain"
                            allowFullScreen
                            style={{
                              border: 'none',
                            }}
                            onMouseEnter={() =>
                              initPlayer(
                                `ytplayer-${startedGame.match.selection1.id}`
                              )
                            }
                            onMouseLeave={() =>
                              pausePlayer(
                                `ytplayer-${startedGame.match.selection1.id}`
                              )
                            }
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

                  {/* vs text for mobile */}
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
                            id={`ytplayer-${startedGame.match.selection2.id}`}
                            src={getYouTubeEmbedUrl(
                              startedGame.match.selection2.videoUrl,
                              startedGame.match.selection2.startTime,
                              startedGame.match.selection2.endTime
                            )}
                            className="rounded mx-auto w-full h-full object-contain"
                            allowFullScreen
                            style={{
                              border: 'none',
                            }}
                            onMouseEnter={() =>
                              initPlayer(
                                `ytplayer-${startedGame.match.selection2.id}`
                              )
                            }
                            onMouseLeave={() =>
                              pausePlayer(
                                `ytplayer-${startedGame.match.selection2.id}`
                              )
                            }
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
        ></FinalWinnerModal>
      )}

      {/* Full-Size Modal */}
      {fullSizeMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 w-screen h-screen"
          onClick={handleFullSizeClose}
        >
          {fullSizeMedia.isVideo ? (
            <div className="w-full flex justify-center items-center">
              <div className="w-full max-w-[720px] aspect-video">
                <iframe
                  className="w-full h-full rounded"
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

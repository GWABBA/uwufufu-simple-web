'use client';

import {
  createStartedGame,
  pickSelection,
} from '@/services/startedGames.service';
import { Selection, StartedGameResponseDto } from '@/dtos/startedGames.dtos';
import { Worldcup } from '@/dtos/worldcup.dtos';
import { useEffect, useState } from 'react';
import RoundsModal from '@/components/modals/RoundsModal';
import MatchModal from '@/components/modals/MatchModal';
import { fetchSelections } from '@/services/selections.service';
import { SelectionDto } from '@/dtos/selection.dtos';
import Image from 'next/image';
import Pagination from '@/components/common/Pagination';
import LoadingAnimation from '@/components/animation/Loading';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';

interface WorldcupClientProps {
  worldcup: Worldcup;
}

type ModalContent = {
  type: 'image' | 'video';
  src: string;
} | null;

export default function WorldcupClient({ worldcup }: WorldcupClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [modalContent, setModalContent] = useState<ModalContent>(null);

  // ✅ Open modal with image or video
  const openModal = (content: ModalContent) => {
    setModalContent(content);
  };

  // ✅ Close modal when clicked
  const closeModal = () => {
    setModalContent(null);
  };
  const [isFetching, setIsFetching] = useState(false);
  const [rounds, setRounds] = useState(2);
  const [startedGame, setStartedGame] = useState<StartedGameResponseDto | null>(
    null
  );
  const [roundsModalOpen, setRoundsModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selections, setSelections] = useState<SelectionDto[]>([]);
  const [selectionsPage, setSelectionsPage] = useState<number>(1);
  const [selectionsTotalPages, setSelectionsTotalPages] = useState(1);
  const selectionsPerPage = 10;

  const handleOnPlayNow = () => {
    if (worldcup.isNsfw && (!user || (user && user.tier === 'basic'))) {
      alert('You need to be a premium user to play this worldcup');
      router.push('/plans');
      return;
    }
    setRoundsModalOpen(true);
  };

  useEffect(() => {
    const roundOptions: number[] = [];
    let round = 2;
    while (round <= selectionsTotalPages) {
      roundOptions.push(round);
      round *= 2;
    }
    setRounds(roundOptions[roundOptions.length - 1] || 2);
  }, [selectionsTotalPages]);

  useEffect(() => {
    if (startedGame) {
      setMatchModalOpen(true);
    }
  }, [startedGame]);

  useEffect(() => {
    const getSelections = async () => {
      setIsFetching(true);
      const selections = await fetchSelections({
        page: selectionsPage,
        perPage: selectionsPerPage,
        worldcupId: worldcup.id,
      });
      setSelections(selections.data);
      setSelectionsTotalPages(selections.total);
      setIsFetching(false);
    };
    getSelections();
  }, [selectionsPage, worldcup]);

  const handleStartPlaying = async () => {
    const startedGameData = await createStartedGame({
      gameId: worldcup.id,
      roundsOf: rounds,
    });

    if (!startedGameData) return;

    setStartedGame(startedGameData);
  };

  const handleOnSelect = async (selection: Selection) => {
    console.log('ccc');
    if (!startedGame || !startedGame.match) return;
    const newStartedGameData = await pickSelection({
      startedGameId: startedGame.startedGame.id,
      matchId: startedGame.match.id,
      pickedSelectionId: selection.id,
    });

    if (!newStartedGameData) return;

    setStartedGame(newStartedGameData);
  };

  const normalizeYouTubeUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);

      // Extract the video ID from various patterns
      const regexPatterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/, // Regular YouTube watch link
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&]+)/, // Shortened YouTube link
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&]+)/, // Already embedded link
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?&]+)/, // YouTube shorts
      ];

      let videoId: string | null = null;

      for (const pattern of regexPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          videoId = match[1];
          break;
        }
      }

      if (!videoId) return null;

      // Handle additional query parameters
      const params = new URLSearchParams();
      if (urlObj.searchParams.has('t')) {
        params.set(
          'start',
          urlObj.searchParams.get('t')!.replace(/[^\d]/g, '')
        ); // Convert `t=1m30s` → `90`
      }
      if (urlObj.searchParams.has('start')) {
        params.set('start', urlObj.searchParams.get('start')!);
      }
      if (urlObj.searchParams.has('end')) {
        params.set('end', urlObj.searchParams.get('end')!);
      }
      if (urlObj.searchParams.has('list')) {
        params.set('list', urlObj.searchParams.get('list')!);
      }

      // Construct embed URL
      const paramString = params.toString() ? `?${params.toString()}` : '';
      return `https://www.youtube.com/embed/${videoId}${paramString}`;
    } catch (error) {
      console.error('Error normalizing YouTube URL:', error);
      return null;
    }
  };

  const selectionsListDiv = () => {
    if (isFetching) return <LoadingAnimation />;
    if (selections.length === 0) return <div>No games found</div>;
    return (
      <>
        {/* ✅ Modal */}
        {modalContent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={closeModal} // ✅ Close on click
          >
            {modalContent.type === 'image' ? (
              <Image
                src={modalContent.src}
                alt="Full Image"
                className="max-w-full max-h-full object-contain rounded-lg"
                width={800}
                height={600}
              />
            ) : (
              <iframe
                className="w-[80vw] h-[45vw] max-w-3xl max-h-[60vh] rounded-md"
                src={normalizeYouTubeUrl(modalContent.src)!}
                title="Video"
                allowFullScreen
              />
            )}
          </div>
        )}

        {/* Table for Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-white">#</th>
                <th className="p-3 text-white">{t('worldcup.media')}</th>
                <th className="p-3 text-white">{t('worldcup.name')}</th>
                <th className="p-3 text-white">{t('worldcup.win-ratio')}</th>
                <th className="p-3 text-white">
                  {t('worldcup.final-win-ratio')}
                </th>
              </tr>
            </thead>
            <tbody>
              {selections.map((selection) => {
                let finalWinRatio = 0;
                if (worldcup.plays! > 0) {
                  finalWinRatio = (selection.finalWins / worldcup.plays!) * 100;
                }

                return (
                  <tr key={selection.id} className="border-b border-gray-700">
                    <td className="p-3 text-white font-bold">
                      {selection.ranking}
                    </td>

                    {/* ✅ Media (Clickable) */}
                    <td className="p-3 cursor-pointer">
                      {selection.isVideo ? (
                        <div className="relative">
                          <div className="bg-uwu-red absolute top-1 right-3 text-white px-2 rounded-md">
                            Video
                          </div>
                          <Image
                            src={
                              selection.resourceUrl ||
                              '/assets/default-image.jpg'
                            }
                            className="w-36 h-24 object-cover rounded-md"
                            alt={selection.name}
                            width={128}
                            height={96}
                            onClick={() =>
                              openModal({
                                type: 'video',
                                src: selection.videoUrl,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          {worldcup.isNsfw &&
                            (!user || (user && user.tier === 'basic')) && (
                              <div className="absolute backdrop-blur-lg z-10 w-36 h-24 rounded-md" />
                            )}
                          <Image
                            src={
                              selection.resourceUrl ||
                              '/assets/default-image.jpg'
                            }
                            alt={selection.name}
                            className="w-36 h-24 object-cover rounded-md"
                            width={128}
                            height={96}
                            onClick={() =>
                              openModal({
                                type: 'image',
                                src: selection.resourceUrl,
                              })
                            }
                          />
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="p-3 text-white font-medium">
                      {selection.name}
                    </td>

                    {/* Win Ratio */}
                    <td className="p-3">
                      <div className="relative w-40 h-5 bg-gray-700 rounded-md overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${
                              selection.winLossRatio
                                ? (selection.winLossRatio * 100).toFixed(1)
                                : 0
                            }%`,
                          }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {selection.winLossRatio
                            ? (selection.winLossRatio * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </td>

                    {/* Final Win Ratio */}
                    <td className="p-3">
                      <div className="relative w-40 h-5 bg-gray-700 rounded-md overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${finalWinRatio}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {finalWinRatio.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selections (Mobile) */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {selections.map((selection) => {
            let finalWinRatio = 0;
            if (worldcup.plays! > 0) {
              finalWinRatio = (selection.finalWins / worldcup.plays!) * 100;
            }

            return (
              <div
                key={selection.id}
                className="bg-gray-800 p-4 rounded-lg flex flex-col items-center gap-3 relative"
              >
                <p className="text-white text-xl font-bold absolute top-2 left-2">
                  #{selection.ranking}
                </p>

                {/* ✅ Media (Clickable) */}
                <div className="w-36 h-36 relative cursor-pointer">
                  {selection.isVideo ? (
                    <iframe
                      className="w-full h-full rounded-md"
                      src={normalizeYouTubeUrl(selection.videoUrl)!}
                      title={selection.name}
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="relative">
                      {worldcup.isNsfw &&
                        (!user || (user && user.tier === 'basic')) && (
                          <div className="absolute w-full h-40 backdrop-blur-lg z-10 rounded-md" />
                        )}
                      <Image
                        src={
                          selection.resourceUrl || '/assets/default-image.jpg'
                        }
                        alt={selection.name}
                        className="object-cover rounded-md w-full h-40" // ✅ Set fixed height (adjust as needed)
                        width={128}
                        height={120}
                        onClick={() =>
                          openModal({
                            type: 'image',
                            src: selection.resourceUrl,
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className="text-white text-lg font-semibold mt-2">
                  {selection.name}
                </p>

                {/* Win Ratio */}
                <div className="w-full">
                  <p className="text-xs text-gray-400">Win Ratio</p>
                  <div className="relative w-full h-5 bg-gray-700 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${
                          selection.winLossRatio
                            ? (selection.winLossRatio * 100).toFixed(1)
                            : 0
                        }%`,
                      }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {selection.winLossRatio
                        ? (selection.winLossRatio * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                {/* Final Win Ratio */}
                <div className="w-full">
                  <p className="text-xs text-gray-400">Final Win Ratio</p>
                  <div className="relative w-full h-5 bg-gray-700 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${finalWinRatio}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {finalWinRatio.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const changePage = (page: number) => {
    setSelectionsPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto pt-4 md:pt-8 px-2 md:px-0">
      <div className="md:flex justify-between mb-8">
        {/* title and description */}
        <div>
          <h1 className="text-xl md:text-4xl font-extrabold text-white mb-2 md:mb-4">
            {worldcup.title}
          </h1>
          <p className="text-base md:text-lg text-gray-400 mb-4">
            {worldcup.description}
          </p>
          {worldcup.user && (
            <div className="flex items-center">
              {worldcup.user.profileImage ? (
                <Image
                  src={worldcup.user.profileImage!}
                  alt="profile"
                  width={24}
                  height={24}
                  className="rounded-full mr-1"
                ></Image>
              ) : (
                <Image
                  src="/assets/icons/account-circle.svg"
                  alt="profile"
                  width={24}
                  height={24}
                  className="rounded-full mr-1"
                ></Image>
              )}
              <span className="text-base md:text-lg text-gray-400">
                {worldcup.user.name}
              </span>
            </div>
          )}
        </div>
        {/* play button area */}
        <div className="flex justify-center md:block mt-4 md:mt-0">
          <button
            onClick={handleOnPlayNow}
            className="relative overflow-hidden p-2 rounded-lg text-lg md:text-2xl font-extrabold text-white px-16 bg-gradient-to-r from-[#ff6f54] via-uwu-red to-[#8b1e12] bg-[length:200%_200%] animate-gradient-glow"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#ff6f54] via-uwu-red to-[#8b1e12] opacity-50 blur-lg"></span>
            <span className="relative">{t('worldcup.play-now')}</span>
          </button>
        </div>
      </div>

      {/* Render the RoundsModal */}
      <RoundsModal
        isOpen={roundsModalOpen}
        selectionsCount={worldcup.selectionsCount!}
        onClose={() => setRoundsModalOpen(false)}
        onConfirm={() => {
          handleStartPlaying();
          setRoundsModalOpen(false);
        }}
        onRoundsSelect={(selectedRounds) => setRounds(selectedRounds)}
      />

      {/* Match Modal */}
      {matchModalOpen && (
        <MatchModal
          isOpen={matchModalOpen}
          startedGame={startedGame}
          worldcup={worldcup}
          onClose={() => setMatchModalOpen(false)}
          onSelect={handleOnSelect}
        />
      )}

      {/* selections */}
      {!isFetching ? (
        <div className="w-full">
          {selectionsListDiv()}

          {/* Pagination */}
          <Pagination
            currentPage={selectionsPage}
            totalItems={selectionsTotalPages}
            itemsPerPage={selectionsPerPage}
            pagesToShow={7}
            onPageChange={changePage}
          ></Pagination>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { StartedGameWithGameResponseDto } from '@/dtos/startedGames.dtos';
import {
  deleteStartedGame,
  fetchMyStartedGames,
} from '@/services/startedGames.service';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Virtuoso } from 'react-virtuoso';
import LoadingAnimation from '@/components/animation/Loading';
import { Trash2 } from 'lucide-react';

export default function MyPlays() {
  const { t } = useTranslation();
  const [startedGames, setStartedGames] = useState<
    StartedGameWithGameResponseDto[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [hasMore, setHasMore] = useState(true);

  const virtuosoRef = useRef(null);
  const isFetchingRef = useRef(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const getColumnCount = (width: number) => {
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return 3;
  };

  const columnCount = getColumnCount(windowWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchStartedGames(1);
  }, []);

  const fetchStartedGames = async (targetPage: number) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetchMyStartedGames({ page: targetPage, perPage });
      if (targetPage === 1) {
        setStartedGames(response);
      } else {
        setStartedGames((prev) => [...prev, ...response]);
      }
      setPage(targetPage);
      setHasMore(response.length === perPage);
    } catch (error) {
      console.error('Error fetching started games:', error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setInitialLoading(false);
    }
  };

  const loadMoreGames = useCallback(async () => {
    if (!hasMore || isFetchingRef.current) return;

    try {
      await fetchStartedGames(page + 1);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, page]);

  const getGameLink = (startedGame: StartedGameWithGameResponseDto) => {
    if (startedGame.status === 'IS_COMPLETED') {
      return `/worldcup/${startedGame.game.slug}`;
    } else {
      return `/worldcup/${startedGame.game.slug}?startedGameId=${startedGame.id}`;
    }
  };

  const onDeleteClicked = async (
    startedGame: StartedGameWithGameResponseDto
  ) => {
    if (!confirm(t('play-history.confirm-delete'))) return;
    try {
      await deleteStartedGame(startedGame.id);
      setStartedGames((prev) =>
        prev.filter((game) => game.id !== startedGame.id)
      );
    } catch (error) {
      console.error('Error deleting started game:', error);
    }
  };

  const renderRow = (index: number) => {
    const startIdx = index * columnCount;
    const rowItems = visible.slice(startIdx, startIdx + columnCount);

    return (
      <div className="flex w-full mb-8">
        {rowItems.map((startedGame) => (
          <div
            key={startedGame.id}
            className="p-2"
            style={{ width: `${100 / columnCount}%` }}
          >
            <Link
              href={getGameLink(startedGame)}
              className="block bg-uwu-dark-gray rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden transform hover:scale-105 h-full"
            >
              <div className="w-full h-60 relative">
                {startedGame.game.coverImage && (
                  <Image
                    src={startedGame.game.coverImage}
                    alt={startedGame.game.title}
                    fill
                    className="rounded-t-2xl object-cover z-0"
                    unoptimized
                  />
                )}
                <div className="absolute top-2 right-2 z-10">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      startedGame.status === 'IS_COMPLETED'
                        ? 'bg-red-600 text-white'
                        : 'bg-uwu-blue text-white'
                    }`}
                  >
                    {startedGame.status === 'IS_COMPLETED'
                      ? t('play-history.completed')
                      : t('in-progress')}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col justify-between h-[calc(100%-240px)]">
                <div>
                  <div className="flex items-center text-sm text-gray-300 mb-2 justify-between">
                    <span className="text-uwuRed font-semibold">
                      Rounds of {startedGame.roundsOf}
                    </span>
                    {startedGame.game.user && (
                      <div className="flex items-center">
                        <span className="text-gray-400">
                          {startedGame.game.user.name}
                        </span>
                      </div>
                    )}
                    <button>
                      <Trash2
                        onClick={(e) => {
                          e.preventDefault(); // prevent link navigation
                          onDeleteClicked(startedGame);
                        }}
                        className="text-gray-600 hover:scale-125"
                      />
                    </button>
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-white line-clamp-1">
                    {startedGame.game.title}
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-1">
                    {startedGame.game.description ||
                      t('worldcup.no-description')}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  const visible = startedGames.filter((sg) => sg.game);
  const rowCount = Math.ceil(visible.length / columnCount);

  const Footer = () => (
    <div className="py-4 flex justify-center">
      {isLoading && hasMore ? <LoadingAnimation /> : null}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto pt-4 md:pt-8 flex flex-col">
      <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-8">
        {t('play-history.play-history')}
      </h1>
      {initialLoading ? (
        <div className="flex justify-center py-8">
          <LoadingAnimation />
        </div>
      ) : startedGames.length === 0 ? (
        <div className="text-center text-white py-8">
          {t('play-history.no-plays')}
        </div>
      ) : (
        <Virtuoso
          ref={virtuosoRef}
          useWindowScroll
          totalCount={rowCount}
          overscan={5}
          itemContent={renderRow}
          components={{ Footer }}
          endReached={() => {
            loadMoreGames();
          }}
        />
      )}
    </div>
  );
}

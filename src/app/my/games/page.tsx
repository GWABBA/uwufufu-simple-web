'use client';

import { Worldcup } from '@/dtos/worldcup.dtos';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/common/Pagination';
import { useEffect, useState } from 'react';
import { deleteWorldcup, fetchMyWorldcups } from '@/services/worldcup.service';
import toast from 'react-hot-toast';
import { Visibility } from '@/enums/enums.enum';
import { useTranslation } from 'react-i18next';
import LoadingAnimation from '@/components/animation/Loading';
import { Pencil, Trash2 } from 'lucide-react';

export default function MyGames() {
  const { t } = useTranslation();
  const router = useRouter();

  const itemsPerPage = 15;
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [games, setGames] = useState<Worldcup[]>([]);

  const getVisibilityLabel = (visibility: Visibility) => {
    switch (visibility) {
      case Visibility.IsPublic:
        return { text: 'Public', bg: 'bg-green-500' };
      case Visibility.IsPrivate:
        return { text: 'Private', bg: 'bg-yellow-500' };
      case Visibility.IsClosed:
        return { text: 'Closed', bg: 'bg-red-500' };
      default:
        return { text: 'Unknown', bg: 'bg-gray-500' };
    }
  };

  useEffect(() => {
    setIsLoadingList(true);
    const fetchMyGames = async () => {
      try {
        const response = await fetchMyWorldcups({
          page: currentPage,
          perPage: itemsPerPage,
        });
        setGames(response.worldcups);
        setTotalItemsCount(response.total);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(t('common.unknown-error-occurred'));
        }
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchMyGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  if (isLoadingList) {
    return <LoadingAnimation />;
  }

  const onEditClicked = (game: Worldcup) => {
    router.push(`/create-game/${game.id}`);
  };

  const onDeleteClicked = async (game: Worldcup) => {
    const confirmDelete = confirm(
      t('create-worldcup.are-your-sure-you-want-to-delete-this-worldcup')
    );
    if (confirmDelete) {
      try {
        await deleteWorldcup(game.id);
        setGames((prevGames) => prevGames.filter((g) => g.id !== game.id));
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(t('common.unknown-error-occurred'));
        }
      }

      toast.success(t('create-worldcup.worldcup-deleted-successfully'));
    }
  };

  const playGame = (game: Worldcup) => () => {
    if (game.visibility === Visibility.IsClosed) {
      toast.error(t('create-worldcup.cannot-play-closed'));
      return;
    }
    router.push(`/worldcup/${game.slug}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-4 md:pt-8">
      <h1 className="text-xl md:text-4xl font-bold text-white mb-8">
        {t('worldcup.my-worldcup')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const visibility = getVisibilityLabel(game.visibility);
          return (
            <div
              key={game.id}
              className="block bg-uwu-dark-gray rounded-2xl shadow-md hover:shadow-lg cursor-pointer transition-shadow duration-200 overflow-hidden relative transform hover:scale-105"
              onClick={playGame(game)}
            >
              {/* Cover Image */}
              <div className="w-full h-60 relative">
                {game.coverImage ? (
                  <Image
                    src={game.coverImage || '/assets/default-game-cover.jpg'}
                    alt={game.title}
                    fill
                    className="rounded-t-2xl object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex justify-center">
                    <div className="mt-10 text-white">No Image</div>
                  </div>
                )}
              </div>

              <div className="p-4">
                {/* Visibility Badge */}
                <div
                  className={`absolute top-4 right-4 text-xs text-white px-2 py-1 rounded-md ${visibility.bg}`}
                >
                  {visibility.text}
                </div>

                {/* Category & NSFW Row */}
                <div className="flex items-center text-sm text-gray-300 mb-2 justify-between">
                  <div>
                    <span className="text-uwuRed font-semibold">
                      {game.category ? game.category.name : 'Unknown'}
                    </span>

                    {/* NSFW Indicator */}
                    {game.isNsfw && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-md">
                        NSFW
                      </span>
                    )}
                  </div>
                  <div className="flex">
                    <button className="mr-2">
                      <Pencil
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onEditClicked(game);
                        }}
                        className="text-uwu-red hover:scale-125"
                      ></Pencil>
                    </button>
                    <button>
                      <Trash2
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onDeleteClicked(game);
                        }}
                        className="text-gray-600 hover:scale-125"
                      ></Trash2>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg md:text-xl font-semibold text-white line-clamp-1">
                  {game.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                  {game.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {/* pagination */}
      {!isLoadingList ? (
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItemsCount}
          pagesToShow={7}
        />
      ) : null}
    </div>
  );
}

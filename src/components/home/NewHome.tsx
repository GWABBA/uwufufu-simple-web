'use client';

import { ListSortType, Locales } from '@/enums/enums.enum';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { useState, useEffect, useRef, useCallback } from 'react';
import { LocaleNames } from '@/constants/locale';
import { Search, X, GalleryHorizontalEnd } from 'lucide-react';
import { fetchWorldcups } from '@/services/worldcup.service';
import { Worldcup } from '@/dtos/worldcup.dtos';
import Link from 'next/link';
import Image from 'next/image';
import {
  setIncludeNsfw,
  setPage,
  setSearchQuery,
  setSelectedCategories,
  setSelectedLanguages,
  setSortBy,
} from '@/store/slices/worldcups.reducer';
import LoadingAnimation from '../animation/Loading';
import { useTranslation } from 'react-i18next';
import { Virtuoso } from 'react-virtuoso';

export default function NewHomeComponent() {
  const { t } = useTranslation();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const nsfwDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();
  const virtuosoRef = useRef(null);

  // for categories list
  const categories = useAppSelector(
    (state: RootState) => state.categories.categories
  );

  // query params
  const perPage = useAppSelector((state: RootState) => state.worldcups.perPage);
  const sortBy = useAppSelector((state: RootState) => state.worldcups.sortBy);
  const selectedCategories = useAppSelector(
    (state: RootState) => state.worldcups.selectedCategories
  );
  const selectedLanguages = useAppSelector(
    (state: RootState) => state.worldcups.selectedLanguages
  );
  const searchQuery = useAppSelector(
    (state: RootState) => state.worldcups.searchQuery
  );
  const includeNsfw = useAppSelector(
    (state: RootState) => state.worldcups.includeNsfw
  );
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [games, setGames] = useState<Worldcup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const hasMore = games.length < totalCount;

  // Window dimensions for responsive column count
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // ✅ Separate temp state for modals (modals will update temp states first)
  const [tempSelectedCategories, setTempSelectedCategories] = useState<
    string[]
  >([...selectedCategories]);
  const [tempSelectedLanguages, setTempSelectedLanguages] = useState<Locales[]>(
    [...selectedLanguages]
  );

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Calculate appropriate column count based on screen width
  const getColumnCount = (width: number) => {
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return 3;
  };

  const columnCount = getColumnCount(windowWidth);
  const isFetchingRef = useRef(false);
  const lastPageLoaded = useRef(1);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setTempSearchQuery(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Fetch initial games
  useEffect(() => {
    const fetchInitialGames = async () => {
      setIsFetching(true);
      isFetchingRef.current = true;

      try {
        const { worldcups, total } = await fetchWorldcups({
          page: 1,
          perPage,
          sortBy,
          categories: selectedCategories,
          locale: selectedLanguages as Locales[],
          search: searchQuery,
          includeNsfw,
        });

        setGames(worldcups);
        setTotalCount(total);
        dispatch(setPage(1));
        lastPageLoaded.current = 1; // Important initialization
      } finally {
        setIsFetching(false);
        isFetchingRef.current = false;
        setInitialLoading(false);
      }
    };

    fetchInitialGames();
  }, [
    perPage,
    sortBy,
    selectedCategories,
    selectedLanguages,
    searchQuery,
    includeNsfw,
    dispatch,
  ]);

  const loadMoreGames = useCallback(async () => {
    if (!hasMore || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsFetching(true);

    const nextPage = lastPageLoaded.current + 1;

    try {
      const { worldcups, total } = await fetchWorldcups({
        page: nextPage,
        perPage,
        sortBy,
        categories: selectedCategories,
        locale: selectedLanguages as Locales[],
        search: searchQuery,
        includeNsfw,
      });

      setGames((prev) => [...prev, ...worldcups]);
      setTotalCount(total);
      dispatch(setPage(nextPage));
      lastPageLoaded.current = nextPage;
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
    }
  }, [
    perPage,
    sortBy,
    selectedCategories,
    selectedLanguages,
    searchQuery,
    includeNsfw,
    dispatch,
    hasMore,
  ]);

  // ✅ Sort Change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = event.target.value as ListSortType;
    dispatch(setPage(1)); // ✅ Reset page to 1
    dispatch(setSortBy(newSort));
  };

  // ✅ Category Selection (only updates temp state)
  const handleCategoryToggle = (categoryId: number) => {
    setTempSelectedCategories((prev) =>
      prev.includes(categoryId.toString())
        ? prev.filter((id) => id !== categoryId.toString())
        : [...prev, categoryId.toString()]
    );
  };

  // ✅ Language Selection (only updates temp state)
  const handleLanguageToggle = (locale: Locales) => {
    setTempSelectedLanguages((prev) =>
      prev.includes(locale)
        ? prev.filter((l) => l !== locale)
        : [...prev, locale]
    );
  };

  const handleIncludeNsfwChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (nsfwDebounceTimer.current) {
      clearTimeout(nsfwDebounceTimer.current);
    }

    const isChecked = event.target.checked;

    // Debounce logic (500ms delay)
    nsfwDebounceTimer.current = setTimeout(() => {
      dispatch(setPage(1)); // ✅ Reset page to 1
      dispatch(setIncludeNsfw(isChecked)); // ✅ Properly dispatch action
    }, 500);
  };

  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = event.target.value;
    setTempSearchQuery(newSearchQuery);

    // Clear existing debounce timer
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    searchDebounceTimer.current = setTimeout(() => {
      dispatch(setSearchQuery(newSearchQuery));
      dispatch(setPage(1)); // ✅ Reset page to 1
    }, 500);
  };

  const toggleBodyScroll = (shouldLock: boolean) => {
    document.body.style.overflow = shouldLock ? 'hidden' : '';
  };

  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
    toggleBodyScroll(true); // Lock scroll
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    dispatch(setSelectedCategories(tempSelectedCategories));
    dispatch(setPage(1));
    toggleBodyScroll(false); // Unlock scroll
  };

  const openLanguageModal = () => {
    setIsLanguageModalOpen(true);
    toggleBodyScroll(true); // Lock scroll
  };

  const closeLanguageModal = () => {
    setIsLanguageModalOpen(false);
    dispatch(setSelectedLanguages(tempSelectedLanguages));
    dispatch(setPage(1));
    toggleBodyScroll(false); // Unlock scroll
  };

  // ✅ Properly format selected categories/languages display
  const formatSelected = (items: string[], defaultText: string) =>
    items.length === 0
      ? defaultText
      : items.length === 1
      ? items[0]
      : `${items.length} selected`;

  const formatSelectedCategories = (
    categoryIds: string[],
    defaultText: string
  ) => {
    if (categoryIds.length === 0) return defaultText;
    if (categoryIds.length === 1) {
      const selectedCategory = categories.find(
        (c) => c.id.toString() === categoryIds[0]
      );
      return selectedCategory ? selectedCategory.name : defaultText;
    }
    return `${categoryIds.length} selected`;
  };

  function formatPlayCount(count: number): string {
    if (count >= 1_000_000) return '1M+';
    if (count >= 100_000) return '100K+';
    if (count >= 10_000) return '10K+';
    if (count >= 1_000) return '1K+';
    if (count >= 100) return '100+';
    if (count >= 10) return '10+';
    return count.toString();
  }

  // Function to render a row of items
  const renderRow = (index: number) => {
    // Each row has `columnCount` number of items
    const startIdx = index * columnCount;
    const rowItems = games.slice(startIdx, startIdx + columnCount);

    return (
      <div className="flex w-full mb-8">
        {rowItems.map((game) => (
          <div
            key={game.id}
            className="p-2"
            style={{ width: `${100 / columnCount}%` }}
          >
            <Link
              href={`/worldcup/${game.slug}`}
              className="block bg-uwu-dark-gray rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden transform hover:scale-105 h-full"
            >
              <div className="w-full h-60 relative">
                <div className="absolute ml-2 px-2 py-1 text-base font-semibold text-white bg-uwu-dark-gray rounded-md z-20 top-2 left-2 flex items-center">
                  <GalleryHorizontalEnd className="mr-2"></GalleryHorizontalEnd>
                  {game.selectionCount}
                </div>
                {game.isNsfw && (
                  <span className="absolute ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-md z-20 top-2 right-2">
                    NSFW
                  </span>
                )}
                <div
                  className="absolute ml-2 px-2 py-1 text-base font-semibold text-white bg-uwu-dark-gray rounded-md z-20 bottom-2 left-2 flex items-center"
                  title={`${game.plays?.toLocaleString() || 0} Plays`} // Tooltip shows full number
                >
                  {formatPlayCount(game.plays || 0)} Plays
                </div>

                {/* blur when nsfw */}
                {game.isNsfw && (!user || (user && user.tier === 'basic')) && (
                  <div className="absolute w-full h-full backdrop-blur-lg z-10"></div>
                )}
                <Image
                  src={
                    game.coverImage || '/assets/common/default-thumbnail.webp'
                  }
                  alt={game.title}
                  fill
                  className="rounded-t-2xl object-cover z-0"
                  unoptimized
                />
              </div>
              <div className="p-4 flex flex-col justify-between h-[calc(100%-240px)]">
                <div>
                  <div className="flex items-center text-sm text-gray-300 mb-2 justify-between">
                    <span className="text-uwuRed font-semibold">
                      {game.category?.name || 'Unknown'}
                    </span>
                    {game.user && (
                      <div className="flex items-center">
                        {game.user.profileImage ? (
                          <Image
                            src={game.user.profileImage!}
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
                        <span className="text-gray-400">{game.user.name}</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-white line-clamp-1">
                    {game.title}
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-1">
                    {game.description}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  // Footer component for loading
  const Footer = () => {
    return (
      <div className="py-4 flex justify-center">
        {isFetching && hasMore ? <LoadingAnimation /> : null}
      </div>
    );
  };

  // Calculate number of rows
  const rowCount = Math.ceil(games.length / columnCount);

  return (
    <div className="w-full max-w-6xl mx-auto pt-4 md:pt-8 flex flex-col">
      {/* filters */}
      <div>
        <div className="grid grid-cols-2 md:flex md:space-x-2 gap-2 px-2 md:p-0 mb-4">
          {/* Sort */}
          <select
            id="sort"
            className="p-2 rounded-md bg-uwu-dark-gray text-white md:min-w-32"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="latest">{t('home.latest')}</option>
            <option value="popularity">{t('home.popularity')}</option>
          </select>

          {/* Categories */}
          <select
            id="category"
            className="p-2 rounded-md bg-uwu-dark-gray text-white md:min-w-52"
            value={formatSelectedCategories(
              selectedCategories,
              `${t('home.select-categories')}`
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              openCategoryModal();
            }}
            onChange={() => {}}
          >
            <option>
              {formatSelectedCategories(
                selectedCategories,
                `${t('home.select-categories')}`
              )}
            </option>
          </select>

          {/* Languages */}
          <select
            id="language"
            className="p-2 rounded-md bg-uwu-dark-gray text-white md:min-w-40"
            value={formatSelected(
              selectedLanguages,
              `${t('home.select-languages')}`
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              openLanguageModal();
            }}
            onChange={() => {}}
          >
            <option>
              {formatSelected(
                selectedLanguages,
                `${t('home.select-languages')}`
              )}
            </option>
          </select>

          {/* Search */}
          <div className="relative flex-1 md:min-w-40">
            <input
              type="text"
              placeholder="Search..."
              className="p-2 pl-10 pr-8 w-full rounded-md bg-uwu-dark-gray text-white outline-none"
              value={tempSearchQuery}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-2 top-2 text-gray-400 w-5 h-5" />
            {searchQuery && (
              <button
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
                onClick={() => dispatch(setSearchQuery(''))}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="pt-0 px-2 md:px-0 mb-4">
          <input
            id="includeNsfw"
            type="checkbox"
            onChange={(e) => handleIncludeNsfwChange(e)}
            checked={includeNsfw}
          />
          <label htmlFor="includeNsfw" className="text-uwu-red ml-2">
            {t('home.include-nsfw')}
          </label>
        </div>
      </div>

      {/* Games grid - virtualized with body scroll */}
      <div className="w-full">
        {initialLoading ? (
          <div className="flex justify-center py-8">
            <LoadingAnimation />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center text-white py-8">No games found</div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            useWindowScroll
            totalCount={rowCount}
            overscan={5}
            itemContent={renderRow}
            components={{ Footer }}
            endReached={() => {
              if (hasMore && !isFetchingRef.current) {
                loadMoreGames();
              }
            }}
          />
        )}
      </div>

      {/* Category Selection Modal */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeCategoryModal}
        >
          <div
            className="bg-uwu-dark-gray p-6 rounded-lg w-full max-w-2xl relative max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white"
              onClick={closeCategoryModal}
            >
              <X size={32} />
            </button>
            <h2 className="text-white text-lg font-bold mb-4">
              {t('home.select-categories')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`p-2 rounded-md transition ${
                    tempSelectedCategories.includes(category.id.toString())
                      ? 'bg-uwu-red text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {isLanguageModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeLanguageModal}
        >
          <div
            className="bg-uwu-dark-gray p-6 rounded-lg w-full max-w-2xl relative max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white"
              onClick={closeLanguageModal}
            >
              <X size={32} />
            </button>
            <h2 className="text-white text-lg font-bold mb-4">
              Select Languages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(LocaleNames).map(([key, label]) => (
                <button
                  key={key}
                  className={`p-2 rounded-md transition ${
                    tempSelectedLanguages.includes(key as Locales)
                      ? 'bg-uwu-red text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  onClick={() => handleLanguageToggle(key as Locales)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

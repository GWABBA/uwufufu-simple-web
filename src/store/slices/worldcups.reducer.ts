import { Worldcup } from '@/dtos/worldcup.dtos';
import { ListSortType, Locales } from '@/enums/enums.enum';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type HomeCache = {
  key: string;
  games: Worldcup[];
  total: number;
  page: number;
  lastPageLoaded: number;
  /** top-most visible row index for Virtuoso restore */
  firstVisibleIndex?: number; // <— add this
  ts: number;
};

interface WorldcupsState {
  page: number;
  perPage: number;
  selectedLanguages: Locales[];
  selectedCategories: string[];
  sortBy: ListSortType;
  searchQuery: string;
  includeNsfw: boolean;
  homeCache: HomeCache | null;
}

const initialState: WorldcupsState = {
  page: 1,
  perPage: 12,
  selectedLanguages: [],
  selectedCategories: [],
  sortBy: ListSortType.latest,
  searchQuery: '',
  includeNsfw: false,
  homeCache: null,
};

export const buildHomeKey = (params: {
  perPage: number;
  sortBy: string;
  categories: string[];
  languages: Locales[];
  search: string;
  includeNsfw: boolean;
}) =>
  JSON.stringify({
    p: params.perPage,
    s: params.sortBy,
    c: [...params.categories].sort(),
    l: [...params.languages].sort(),
    q: params.search || '',
    n: params.includeNsfw,
  });

const worldcupsSlice = createSlice({
  name: 'worldcups',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPerPage(state, action: PayloadAction<number>) {
      state.perPage = action.payload;
    },
    setSelectedLanguages(state, action: PayloadAction<Locales[]>) {
      state.selectedLanguages = action.payload;
    },
    setSelectedCategories(state, action: PayloadAction<string[]>) {
      state.selectedCategories = action.payload;
    },
    setSortBy(state, action: PayloadAction<ListSortType>) {
      state.sortBy = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setIncludeNsfw(state, action: PayloadAction<boolean>) {
      state.includeNsfw = action.payload;
    },
    setHomeCache(state, action: PayloadAction<HomeCache>) {
      state.homeCache = action.payload;
    },
    clearHomeCache(state) {
      state.homeCache = null;
    },
  },
});

export const {
  setPage,
  setPerPage,
  setSelectedLanguages,
  setSelectedCategories,
  setSortBy,
  setSearchQuery,
  setIncludeNsfw,
  setHomeCache,
  clearHomeCache,
} = worldcupsSlice.actions;

export default worldcupsSlice.reducer;

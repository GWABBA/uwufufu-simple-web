import { ListSortType, Locales } from '@/enums/enums.enum';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorldcupsState {
  page: number;
  perPage: number;
  selectedLanguages: Locales[];
  selectedCategories: string[];
  sortBy: ListSortType;
  searchQuery: string;
  includeNsfw: boolean;
}

const initialState: WorldcupsState = {
  page: 1,
  perPage: 12,
  selectedLanguages: [],
  selectedCategories: [],
  sortBy: ListSortType.latest,
  searchQuery: '',
  includeNsfw: false,
};

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
} = worldcupsSlice.actions;

export default worldcupsSlice.reducer;

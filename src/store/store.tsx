import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.reducer';
import worldcupReducer from './slices/worldcup.reducer';
import categoriesReducer from './slices/categories.reducer';
import worldcupsReducer from './slices/worldcups.reducer';

export const createStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      worldcup: worldcupReducer,
      categories: categoriesReducer,
      worldcups: worldcupsReducer,
    },
    preloadedState, // Pass the preloaded state here
  });

export const store = createStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

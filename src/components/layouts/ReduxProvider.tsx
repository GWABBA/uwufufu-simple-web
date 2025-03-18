'use client';

import { Provider } from 'react-redux';
import { createStore, RootState } from '@/store/store'; // Adjust the import path as needed

export default function ReduxProvider({
  children,
  preloadedState = {}, // Preloaded state default
}: {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>; // Type preloadedState manually
}) {
  const store = createStore(preloadedState);

  return <Provider store={store}>{children}</Provider>;
}

import { createStore } from './store';

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<
  ReturnType<typeof createStore>['dispatch']
>;

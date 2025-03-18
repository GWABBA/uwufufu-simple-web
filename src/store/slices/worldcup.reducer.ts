import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Worldcup } from '../../dtos/worldcup.dtos';

interface WorldcupState {
  currentWorldCup: Worldcup | null;
}

const initialState: WorldcupState = {
  currentWorldCup: null,
};

const worldcupSlice = createSlice({
  name: 'worldcup',
  initialState,
  reducers: {
    setWorldcup(state, action: PayloadAction<Worldcup>) {
      state.currentWorldCup = action.payload;
    },
  },
});

export const { setWorldcup } = worldcupSlice.actions;

export default worldcupSlice.reducer;

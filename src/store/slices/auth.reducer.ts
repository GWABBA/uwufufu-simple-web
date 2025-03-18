import { User } from '@/dtos/user.dtos';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  user: User | null;
  isInitialized: boolean;
}

const initialState: UserState = {
  user: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isInitialized = true;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

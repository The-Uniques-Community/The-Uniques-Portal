import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null, // Stores the current user's data
  isAuthenticated: false, // Tracks if the user is authenticated
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    clearUser(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions; // Export actions
export default userSlice.reducer; // Export reducer

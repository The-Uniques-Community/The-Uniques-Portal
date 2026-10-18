import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import { setStoreInstance } from '@/services/apiClient';

const store = configureStore({
  reducer: {
    user: userReducer, // Add other slices here
  },
});

setStoreInstance(store);

export default store;

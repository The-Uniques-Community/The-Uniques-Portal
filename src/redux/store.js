import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import { setStoreInstance } from '@/services/apiClient';

const store = configureStore({
  reducer: {
    user: userReducer, // Add other slices here
  },
});

setStoreInstance(store);
if (typeof window !== "undefined") {
  window.__REDUX_STORE__ = store;
}

export default store;

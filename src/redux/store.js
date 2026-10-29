/**
 * @file store.js
 * @description Redux Toolkit store configuration configuring application-wide state management slices and linking store dispatch with the API client.
 * @architecture Instantiated and provided via react-redux in `src/main.jsx`. Directly injected into `src/services/apiClient.js` to permit non-hook store access in interceptors.
 * @agent_note Integrates `userReducer`. Exposes `setStoreInstance(store)` to apiClient and registers `window.__REDUX_STORE__` in browser environments for runtime diagnostics.
 */

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import { setStoreInstance } from '@/services/apiClient';

/**
 * @desc Central Redux store configured with user slice reducer and default middleware.
 * @type {import('@reduxjs/toolkit').EnhancedStore}
 */
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

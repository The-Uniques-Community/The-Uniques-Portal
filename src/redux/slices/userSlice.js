/**
 * @file userSlice.js
 * @description Redux Toolkit slice managing authentication status, coordinator profile,
 * tasks, dashboard statistics, and asynchronous operations.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import coordinatorService from '../../services/coordinatorService.js';

/**
 * Safe localStorage reader preventing crashes in SSR/Node/non-browser contexts.
 * @param {string} key
 * @returns {string|null}
 */
const getSafeStorageItem = (key) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Safe localStorage setter preventing crashes in SSR/Node/non-browser contexts.
 * @param {string} key
 * @param {string} value
 */
const setSafeStorageItem = (key, value) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  } else if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
};

/**
 * Safe localStorage remover preventing crashes in SSR/Node/non-browser contexts.
 * @param {string} key
 */
const removeSafeStorageItem = (key) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  } else if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

/**
 * Safely parse user JSON from storage if present.
 * @returns {Object|null}
 */
const getInitialCurrentUser = () => {
  const raw = getSafeStorageItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Construct initial state with safe hydration from localStorage.
 */
export const getInitialState = () => ({
  currentUser: getInitialCurrentUser(),
  isAuthenticated: Boolean(getSafeStorageItem('token')),
  role: getSafeStorageItem('role') || null,
  profile: null,
  tasks: [],
  stats: null,
  isLoading: false,
  isUpdating: false,
  error: null,
});

const initialState = getInitialState();

/**
 * Async Thunk: Fetch Coordinator Profile
 * Backend endpoint: GET /api/member/getProfile
 */
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await coordinatorService.getCoordinatorProfile();
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch user profile'
      );
    }
  }
);

/**
 * Async Thunk: Update Coordinator Profile
 * Backend endpoint: PUT /api/admin/member/:id
 */
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const data = await coordinatorService.updateCoordinatorProfile(id, updateData);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to update user profile'
      );
    }
  }
);

/**
 * Async Thunk: Fetch Coordinator Tasks
 * Backend endpoint: GET /api/uniques360/tasks/coordinator/current
 */
export const fetchCoordinatorTasks = createAsyncThunk(
  'user/fetchCoordinatorTasks',
  async (_, { rejectWithValue }) => {
    try {
      const data = await coordinatorService.getCoordinatorTasks();
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch coordinator tasks'
      );
    }
  }
);

/**
 * Async Thunk: Fetch Coordinator Dashboard Stats
 * Aggregated backend endpoints: /api/admin/member/counts, /api/events/counts, /api/uniques360/tasks/coordinator/current
 */
export const fetchCoordinatorStats = createAsyncThunk(
  'user/fetchCoordinatorStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await coordinatorService.getCoordinatorDashboardStats();
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch coordinator stats'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      if (action.payload?.role) {
        state.role = action.payload.role;
      }
      state.error = null;
      if (action.payload) {
        setSafeStorageItem('user', JSON.stringify(action.payload));
      }
    },
    clearUser(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.role = null;
      state.profile = null;
      state.tasks = [];
      state.stats = null;
      state.isLoading = false;
      state.isUpdating = false;
      state.error = null;
      removeSafeStorageItem('token');
      removeSafeStorageItem('user');
      removeSafeStorageItem('role');
    },
  },
  extraReducers: (builder) => {
    // -------------------------------------------------------------------------
    // fetchUserProfile
    // -------------------------------------------------------------------------
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.currentUser = action.payload;
        if (action.payload?.role) {
          state.role = action.payload.role;
        }
        if (action.payload) {
          setSafeStorageItem('user', JSON.stringify(action.payload));
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch user profile';
      });

    // -------------------------------------------------------------------------
    // updateUserProfile
    // -------------------------------------------------------------------------
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload;
        state.currentUser = action.payload;
        if (action.payload?.role) {
          state.role = action.payload.role;
        }
        if (action.payload) {
          setSafeStorageItem('user', JSON.stringify(action.payload));
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || action.error?.message || 'Failed to update user profile';
      });

    // -------------------------------------------------------------------------
    // fetchCoordinatorTasks
    // -------------------------------------------------------------------------
    builder
      .addCase(fetchCoordinatorTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCoordinatorTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCoordinatorTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch coordinator tasks';
      });

    // -------------------------------------------------------------------------
    // fetchCoordinatorStats
    // -------------------------------------------------------------------------
    builder
      .addCase(fetchCoordinatorStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCoordinatorStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCoordinatorStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch coordinator stats';
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export const logout = clearUser; // Convenience alias
export default userSlice.reducer;

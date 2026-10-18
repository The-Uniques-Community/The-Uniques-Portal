/**
 * @file verify_user_slice.test.js
 * @description Standalone verification test suite for Redux userSlice:
 * Tests initial state hydration, action reducers (setUser, clearUser, logout),
 * and extraReducers handlers for all coordinator async thunks.
 */
import assert from 'assert';
import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  setUser,
  clearUser,
  logout,
  fetchUserProfile,
  updateUserProfile,
  fetchCoordinatorTasks,
  fetchCoordinatorStats,
  getInitialState,
} from '../../src/redux/slices/userSlice.js';

console.log('====================================================');
console.log('🚀 Starting Redux userSlice Unit & Reducer Test Suite');
console.log('====================================================\n');

// Mock fixtures
const mockCoordinatorUser = {
  _id: '67b34e55e88d76077301c23a',
  fullName: 'Yash Kesarwani',
  email: 'officialid.yashkesarwani@gmail.com',
  role: 'coordinator',
  bio: 'Lead Coordinator for The Uniques Portal',
  skills: ['React', 'Node.js', 'System Architecture'],
};

const mockTasks = [
  { _id: 'task-1', title: 'Review Workshop Proposals', status: 'pending', priority: 'high' },
  { _id: 'task-2', title: 'Prepare Budget Report', status: 'completed', priority: 'medium' },
];

const mockStats = {
  memberCounts: { all: 42, active: 38 },
  eventCounts: { totalCount: 15 },
  tasks: mockTasks,
};

async function runTestSuite() {
  // ---------------------------------------------------------------------------
  // TEST 1: Initial State Structure & Defaults
  // ---------------------------------------------------------------------------
  console.log('1. Testing initial state structure and defaults...');
  const initialState = getInitialState();
  assert.strictEqual(initialState.currentUser, null, 'currentUser should default to null');
  assert.strictEqual(initialState.isAuthenticated, false, 'isAuthenticated should default to false');
  assert.strictEqual(initialState.role, null, 'role should default to null');
  assert.strictEqual(initialState.profile, null, 'profile should default to null');
  assert(Array.isArray(initialState.tasks), 'tasks should default to an empty array');
  assert.strictEqual(initialState.tasks.length, 0, 'tasks should have length 0');
  assert.strictEqual(initialState.stats, null, 'stats should default to null');
  assert.strictEqual(initialState.isLoading, false, 'isLoading should default to false');
  assert.strictEqual(initialState.isUpdating, false, 'isUpdating should default to false');
  assert.strictEqual(initialState.error, null, 'error should default to null');
  console.log('   ✅ Initial state structure matches all specification requirements.\n');

  // ---------------------------------------------------------------------------
  // TEST 2: Action Reducer - setUser
  // ---------------------------------------------------------------------------
  console.log('2. Testing setUser action reducer...');
  const stateAfterSetUser = userReducer(initialState, setUser(mockCoordinatorUser));
  assert.deepStrictEqual(stateAfterSetUser.currentUser, mockCoordinatorUser, 'currentUser must match payload');
  assert.strictEqual(stateAfterSetUser.isAuthenticated, true, 'isAuthenticated must be true after setUser');
  assert.strictEqual(stateAfterSetUser.role, 'coordinator', 'role must be set from payload.role');
  assert.strictEqual(stateAfterSetUser.error, null, 'error must be reset to null');
  console.log('   ✅ setUser correctly updates currentUser, isAuthenticated, and role.\n');

  // ---------------------------------------------------------------------------
  // TEST 3: Action Reducer - clearUser and logout alias
  // ---------------------------------------------------------------------------
  console.log('3. Testing clearUser and logout action reducers...');
  assert.strictEqual(clearUser, logout, 'logout must be an alias for clearUser');
  const dirtyState = {
    ...stateAfterSetUser,
    profile: mockCoordinatorUser,
    tasks: mockTasks,
    stats: mockStats,
    isLoading: true,
    isUpdating: true,
    error: 'Temporary error',
  };
  const stateAfterClear = userReducer(dirtyState, clearUser());
  assert.strictEqual(stateAfterClear.currentUser, null, 'currentUser must be null');
  assert.strictEqual(stateAfterClear.isAuthenticated, false, 'isAuthenticated must be false');
  assert.strictEqual(stateAfterClear.role, null, 'role must be null');
  assert.strictEqual(stateAfterClear.profile, null, 'profile must be null');
  assert.deepStrictEqual(stateAfterClear.tasks, [], 'tasks must be reset to empty array');
  assert.strictEqual(stateAfterClear.stats, null, 'stats must be null');
  assert.strictEqual(stateAfterClear.isLoading, false, 'isLoading must be reset to false');
  assert.strictEqual(stateAfterClear.isUpdating, false, 'isUpdating must be reset to false');
  assert.strictEqual(stateAfterClear.error, null, 'error must be reset to null');
  console.log('   ✅ clearUser/logout resets all user, profile, tasks, and stats state.\n');

  // ---------------------------------------------------------------------------
  // TEST 4: extraReducers - fetchUserProfile (pending, fulfilled, rejected)
  // ---------------------------------------------------------------------------
  console.log('4. Testing extraReducers for fetchUserProfile...');
  const fetchPendingState = userReducer(initialState, { type: fetchUserProfile.pending.type });
  assert.strictEqual(fetchPendingState.isLoading, true, 'fetchUserProfile.pending must set isLoading: true');
  assert.strictEqual(fetchPendingState.error, null, 'fetchUserProfile.pending must reset error: null');

  const fetchFulfilledState = userReducer(fetchPendingState, {
    type: fetchUserProfile.fulfilled.type,
    payload: mockCoordinatorUser,
  });
  assert.strictEqual(fetchFulfilledState.isLoading, false, 'fetchUserProfile.fulfilled must set isLoading: false');
  assert.deepStrictEqual(fetchFulfilledState.profile, mockCoordinatorUser, 'profile must be set to payload');
  assert.deepStrictEqual(fetchFulfilledState.currentUser, mockCoordinatorUser, 'currentUser must be updated to profile');
  assert.strictEqual(fetchFulfilledState.role, 'coordinator', 'role must be synchronized with profile');

  const fetchRejectedState = userReducer(fetchPendingState, {
    type: fetchUserProfile.rejected.type,
    payload: 'Network Error: Profile endpoint 500',
  });
  assert.strictEqual(fetchRejectedState.isLoading, false, 'fetchUserProfile.rejected must set isLoading: false');
  assert.strictEqual(fetchRejectedState.error, 'Network Error: Profile endpoint 500', 'error must store failure message');
  console.log('   ✅ fetchUserProfile pending, fulfilled, and rejected handlers verified.\n');

  // ---------------------------------------------------------------------------
  // TEST 5: extraReducers - updateUserProfile (pending, fulfilled, rejected)
  // ---------------------------------------------------------------------------
  console.log('5. Testing extraReducers for updateUserProfile...');
  const updatedUser = { ...mockCoordinatorUser, bio: 'Updated bio by coordinator' };

  const updatePendingState = userReducer(fetchFulfilledState, { type: updateUserProfile.pending.type });
  assert.strictEqual(updatePendingState.isUpdating, true, 'updateUserProfile.pending must set isUpdating: true');
  assert.strictEqual(updatePendingState.error, null, 'updateUserProfile.pending must reset error: null');

  const updateFulfilledState = userReducer(updatePendingState, {
    type: updateUserProfile.fulfilled.type,
    payload: updatedUser,
  });
  assert.strictEqual(updateFulfilledState.isUpdating, false, 'updateUserProfile.fulfilled must set isUpdating: false');
  assert.strictEqual(updateFulfilledState.profile.bio, 'Updated bio by coordinator', 'profile bio should update');
  assert.strictEqual(updateFulfilledState.currentUser.bio, 'Updated bio by coordinator', 'currentUser bio should update');

  const updateRejectedState = userReducer(updatePendingState, {
    type: updateUserProfile.rejected.type,
    payload: 'Validation failed: Bio too long',
  });
  assert.strictEqual(updateRejectedState.isUpdating, false, 'updateUserProfile.rejected must set isUpdating: false');
  assert.strictEqual(updateRejectedState.error, 'Validation failed: Bio too long', 'error must store update error');
  console.log('   ✅ updateUserProfile pending, fulfilled, and rejected handlers verified.\n');

  // ---------------------------------------------------------------------------
  // TEST 6: extraReducers - fetchCoordinatorTasks (pending, fulfilled, rejected)
  // ---------------------------------------------------------------------------
  console.log('6. Testing extraReducers for fetchCoordinatorTasks...');
  const tasksPendingState = userReducer(initialState, { type: fetchCoordinatorTasks.pending.type });
  assert.strictEqual(tasksPendingState.isLoading, true, 'fetchCoordinatorTasks.pending sets isLoading: true');

  const tasksFulfilledState = userReducer(tasksPendingState, {
    type: fetchCoordinatorTasks.fulfilled.type,
    payload: mockTasks,
  });
  assert.strictEqual(tasksFulfilledState.isLoading, false, 'fetchCoordinatorTasks.fulfilled sets isLoading: false');
  assert.deepStrictEqual(tasksFulfilledState.tasks, mockTasks, 'tasks array should match payload');

  const tasksRejectedState = userReducer(tasksPendingState, {
    type: fetchCoordinatorTasks.rejected.type,
    payload: 'Task service unavailable',
  });
  assert.strictEqual(tasksRejectedState.isLoading, false, 'fetchCoordinatorTasks.rejected sets isLoading: false');
  assert.strictEqual(tasksRejectedState.error, 'Task service unavailable');
  console.log('   ✅ fetchCoordinatorTasks pending, fulfilled, and rejected handlers verified.\n');

  // ---------------------------------------------------------------------------
  // TEST 7: extraReducers - fetchCoordinatorStats (pending, fulfilled, rejected)
  // ---------------------------------------------------------------------------
  console.log('7. Testing extraReducers for fetchCoordinatorStats...');
  const statsPendingState = userReducer(initialState, { type: fetchCoordinatorStats.pending.type });
  assert.strictEqual(statsPendingState.isLoading, true, 'fetchCoordinatorStats.pending sets isLoading: true');

  const statsFulfilledState = userReducer(statsPendingState, {
    type: fetchCoordinatorStats.fulfilled.type,
    payload: mockStats,
  });
  assert.strictEqual(statsFulfilledState.isLoading, false, 'fetchCoordinatorStats.fulfilled sets isLoading: false');
  assert.deepStrictEqual(statsFulfilledState.stats, mockStats, 'stats object should match payload');

  const statsRejectedState = userReducer(statsPendingState, {
    type: fetchCoordinatorStats.rejected.type,
    payload: 'Stats aggregation error',
  });
  assert.strictEqual(statsRejectedState.isLoading, false, 'fetchCoordinatorStats.rejected sets isLoading: false');
  assert.strictEqual(statsRejectedState.error, 'Stats aggregation error');
  console.log('   ✅ fetchCoordinatorStats pending, fulfilled, and rejected handlers verified.\n');

  // ---------------------------------------------------------------------------
  // TEST 8: Full Redux Store Integration with configureStore
  // ---------------------------------------------------------------------------
  console.log('8. Testing full Redux store integration with configureStore...');
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
  });

  assert.deepStrictEqual(store.getState().user.tasks, [], 'Initial store tasks should be empty');

  store.dispatch(setUser(mockCoordinatorUser));
  assert.strictEqual(store.getState().user.isAuthenticated, true);
  assert.strictEqual(store.getState().user.role, 'coordinator');

  store.dispatch({ type: fetchUserProfile.fulfilled.type, payload: mockCoordinatorUser });
  assert.deepStrictEqual(store.getState().user.profile, mockCoordinatorUser);

  store.dispatch({ type: fetchCoordinatorTasks.fulfilled.type, payload: mockTasks });
  assert.strictEqual(store.getState().user.tasks.length, 2);

  store.dispatch({ type: fetchCoordinatorStats.fulfilled.type, payload: mockStats });
  assert.strictEqual(store.getState().user.stats.memberCounts.all, 42);

  store.dispatch(logout());
  assert.strictEqual(store.getState().user.isAuthenticated, false);
  assert.strictEqual(store.getState().user.currentUser, null);
  assert.strictEqual(store.getState().user.profile, null);
  assert.strictEqual(store.getState().user.tasks.length, 0);
  assert.strictEqual(store.getState().user.stats, null);
  console.log('   ✅ Redux store dispatch and state transition cycle verified 100%.\n');

  console.log('====================================================');
  console.log('🎉 ALL 8 REDUX USER SLICE TESTS PASSED (100%)');
  console.log('====================================================');
}

runTestSuite().catch((err) => {
  console.error('❌ Test execution error:', err);
  process.exit(1);
});

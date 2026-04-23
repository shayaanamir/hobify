import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addDocument,
  queryCollection,
} from '../services/firestoreService';

// ─────────────────────────── ASYNC THUNKS ─────────────────────────────────────

/** Fetch all sessions for the current user */
export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async (userId, { rejectWithValue }) => {
    try {
      return await queryCollection('sessions', [
        { field: 'userId', op: '==', value: userId },
      ]);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Fetch all sessions globally for recent activity feed */
export const fetchGlobalSessions = createAsyncThunk(
  'sessions/fetchGlobalSessions',
  async (_, { rejectWithValue }) => {
    try {
      return await queryCollection('sessions', [], { field: 'createdAt', direction: 'desc' });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Fetch sessions by a list of user IDs (Following activity). */
export const fetchSessionsByUserIds = createAsyncThunk(
  'sessions/fetchSessionsByUserIds',
  async (userIds, { rejectWithValue }) => {
    if (!userIds || userIds.length === 0) return [];
    try {
      // Firestore 'in' supports up to 30 items
      const chunks = [];
      for (let i = 0; i < userIds.length; i += 30) {
        chunks.push(userIds.slice(i, i + 30));
      }
      const results = await Promise.all(
        chunks.map(chunk =>
          queryCollection('sessions', [{ field: 'userId', op: 'in', value: chunk }])
        )
      );
      return results.flat().sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Log a new session to Firestore */
export const logSessionAsync = createAsyncThunk(
  'sessions/logSessionAsync',
  async ({ userId, session, userName, userAvatarUrl, hobbyName, hobbyIcon, hobbyColor }, { rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      const data = {
        userId,
        userName,
        userAvatarUrl,
        hobbyName,
        hobbyIcon,
        hobbyColor,
        ...session,
        date: session.date || now,
        createdAt: now,
      };
      const id = await addDocument('sessions', data);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────── SLICE ────────────────────────────────────────────
const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: {
    items: [],
    globalItems: [],
    followingItems: [],
    selectedMediaTitle: null,
    selectedMediaHobbyId: null,
    status: 'idle',
    followingStatus: 'idle',
    error: null,
  },
  reducers: {
    selectMedia: (state, action) => {
      state.selectedMediaTitle = action.payload.title;
      state.selectedMediaHobbyId = action.payload.hobbyId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchGlobalSessions.fulfilled, (state, action) => {
        state.globalItems = action.payload;
      })
      .addCase(fetchSessionsByUserIds.pending, (state) => {
        state.followingStatus = 'loading';
      })
      .addCase(fetchSessionsByUserIds.fulfilled, (state, action) => {
        state.followingStatus = 'succeeded';
        state.followingItems = action.payload;
      })
      .addCase(logSessionAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.globalItems.unshift(action.payload);
        // Note: we don't automatically add to followingItems here as it's for OTHER users
      });
  },
});

export const { selectMedia } = sessionsSlice.actions;
export default sessionsSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllSessions = (state) => state.sessions.items;
export const selectGlobalSessions = (state) => state.sessions.globalItems;
export const selectFollowingSessions = (state) => state.sessions.followingItems;

export const selectSessionsByHobbyId = (hobbyId) => (state) =>
  state.sessions.items.filter((s) => s.hobbyId === hobbyId);

export const selectTodaySessions = (state) => {
  const today = new Date().toDateString();
  return state.sessions.items.filter(
    (s) => new Date(s.date).toDateString() === today
  );
};

export const selectSelectedMediaTitle = (state) => state.sessions.selectedMediaTitle;
export const selectSelectedMediaHobbyId = (state) => state.sessions.selectedMediaHobbyId;
export const selectSessionsStatus = (state) => state.sessions.status;
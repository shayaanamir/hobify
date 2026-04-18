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

/** Log a new session to Firestore */
export const logSessionAsync = createAsyncThunk(
  'sessions/logSessionAsync',
  async ({ userId, session }, { rejectWithValue }) => {
    try {
      const data = {
        userId,
        ...session,
        createdAt: new Date().toISOString(),
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
    selectedMediaTitle: null,
    selectedMediaHobbyId: null,
    status: 'idle',
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
      .addCase(logSessionAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const { selectMedia } = sessionsSlice.actions;
export default sessionsSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllSessions = (state) => state.sessions.items;

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

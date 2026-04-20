import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addDocument,
  queryCollection,
  updateDocument,
} from '../services/firestoreService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return "YYYY-MM-DD" for a given Date (or ISO string) in local time */
function toDateStr(date) {
  return new Date(date).toISOString().slice(0, 10);
}

const TODAY = toDateStr(new Date());

/**
 * Compute the new streak given the hobby's last session date and current streak.
 *
 * Rules:
 *  - Same day as lastSessionDate  → no change (already counted today)
 *  - Exactly 1 calendar day after → streak + 1 (consecutive day)
 *  - More than 1 day gap          → reset to 1 (streak broken)
 *  - No previous session          → start at 1
 */
function computeNewStreak(currentStreak = 0, lastSessionDate = null) {
  if (!lastSessionDate) return 1;

  const last = toDateStr(lastSessionDate);

  if (last === TODAY) {
    // Already logged today — don't increment again
    return currentStreak;
  }

  // Difference in calendar days
  const lastMs = new Date(last).getTime();
  const todayMs = new Date(TODAY).getTime();
  const dayDiff = Math.round((todayMs - lastMs) / (1000 * 60 * 60 * 24));

  if (dayDiff === 1) return currentStreak + 1; // consecutive day
  return 1;                                    // gap ≥ 2 days → reset
}

// ─────────────────────────── ASYNC THUNKS ─────────────────────────────────────

/** Fetch all hobbies for the current user */
export const fetchHobbies = createAsyncThunk(
  'hobbies/fetchHobbies',
  async (userId, { rejectWithValue }) => {
    try {
      return await queryCollection('hobbies', [
        { field: 'userId', op: '==', value: userId },
      ]);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Add a new hobby to Firestore */
export const addHobbyAsync = createAsyncThunk(
  'hobbies/addHobbyAsync',
  async ({ userId, hobby }, { rejectWithValue }) => {
    try {
      const data = {
        userId,
        streak: 0,
        totalHours: 0,
        totalSessions: 0,
        lastSessionDate: null,
        ...hobby,
        createdAt: new Date().toISOString(),
      };
      const id = await addDocument('hobbies', data);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Update hobby stats after logging a session */
export const updateHobbyStatsAsync = createAsyncThunk(
  'hobbies/updateHobbyStatsAsync',
  async ({ hobbyId, durationMinutes, currentHobby }, { rejectWithValue }) => {
    try {
      const newStreak = computeNewStreak(
        currentHobby.streak,
        currentHobby.lastSessionDate
      );

      const updates = {
        totalSessions: (currentHobby.totalSessions || 0) + 1,
        totalHours: +((currentHobby.totalHours || 0) + durationMinutes / 60).toFixed(2),
        lastSessionDate: new Date().toISOString(),
        streak: newStreak,
      };

      await updateDocument('hobbies', hobbyId, updates);
      return { hobbyId, updates };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────── SLICE ────────────────────────────────────────────
const hobbiesSlice = createSlice({
  name: 'hobbies',
  initialState: {
    items: [],
    selectedHobbyId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    selectHobby: (state, action) => {
      state.selectedHobbyId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHobbies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHobbies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchHobbies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addHobbyAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateHobbyStatsAsync.fulfilled, (state, action) => {
        const { hobbyId, updates } = action.payload;
        const hobby = state.items.find((h) => h.id === hobbyId);
        if (hobby) Object.assign(hobby, updates);
      });
  },
});

export const { selectHobby } = hobbiesSlice.actions;
export default hobbiesSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllHobbies = (state) => state.hobbies.items;
export const selectSelectedHobbyId = (state) => state.hobbies.selectedHobbyId;
export const selectHobbyById = (id) => (state) =>
  state.hobbies.items.find((h) => h.id === id);
export const selectHobbiesStatus = (state) => state.hobbies.status;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addDocument,
  queryCollection,
  updateDocument,
  deleteDocument,
} from '../services/firestoreService';

// ─────────────────────────── ASYNC THUNKS ─────────────────────────────────────

export const fetchPlannedActivities = createAsyncThunk(
  'plannedActivities/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      return await queryCollection('plannedActivities', [
        { field: 'userId', op: '==', value: userId },
      ]);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addPlannedActivityAsync = createAsyncThunk(
  'plannedActivities/add',
  async ({ userId, activity }, { rejectWithValue }) => {
    try {
      const data = { userId, completed: false, ...activity };
      const id = await addDocument('plannedActivities', data);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleCompleteAsync = createAsyncThunk(
  'plannedActivities/toggleComplete',
  async ({ activityId, completed }, { rejectWithValue }) => {
    try {
      await updateDocument('plannedActivities', activityId, {
        completed: !completed,
      });
      return activityId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removePlannedActivityAsync = createAsyncThunk(
  'plannedActivities/remove',
  async (activityId, { rejectWithValue }) => {
    try {
      await deleteDocument('plannedActivities', activityId);
      return activityId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────── SLICE ────────────────────────────────────────────
const plannedActivitiesSlice = createSlice({
  name: 'plannedActivities',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlannedActivities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlannedActivities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPlannedActivities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addPlannedActivityAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(toggleCompleteAsync.fulfilled, (state, action) => {
        const a = state.items.find((i) => i.id === action.payload);
        if (a) a.completed = !a.completed;
      })
      .addCase(removePlannedActivityAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export default plannedActivitiesSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllPlannedActivities = (state) =>
  state.plannedActivities.items;

export const selectPlannedActivitiesByDate = (dateStr) => (state) =>
  state.plannedActivities.items.filter(
    (a) =>
      new Date(a.date).toDateString() === new Date(dateStr).toDateString()
  );

export const selectUpcomingActivities = (state) => {
  const now = new Date();
  return state.plannedActivities.items
    .filter((a) => new Date(a.date) >= now && !a.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

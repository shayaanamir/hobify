import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addDocument,
  queryCollection,
  updateDocument,
  deleteDocument,
} from '../services/firestoreService';

// ─────────────────────────── ASYNC THUNKS ─────────────────────────────────────

/** Fetch all goals for the current user */
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (userId, { rejectWithValue }) => {
    try {
      return await queryCollection('goals', [
        { field: 'userId', op: '==', value: userId },
      ]);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Add a new goal */
export const addGoalAsync = createAsyncThunk(
  'goals/addGoalAsync',
  async ({ userId, goal }, { rejectWithValue }) => {
    try {
      const data = {
        userId,
        current: 0,
        ...goal,
        createdAt: new Date().toISOString(),
      };
      const id = await addDocument('goals', data);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Update goal progress */
export const updateGoalProgressAsync = createAsyncThunk(
  'goals/updateGoalProgressAsync',
  async ({ goalId, current }, { rejectWithValue }) => {
    try {
      await updateDocument('goals', goalId, { current });
      return { goalId, current };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Remove a goal */
export const removeGoalAsync = createAsyncThunk(
  'goals/removeGoalAsync',
  async (goalId, { rejectWithValue }) => {
    try {
      await deleteDocument('goals', goalId);
      return goalId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────── SLICE ────────────────────────────────────────────
const goalsSlice = createSlice({
  name: 'goals',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addGoalAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateGoalProgressAsync.fulfilled, (state, action) => {
        const goal = state.items.find((g) => g.id === action.payload.goalId);
        if (goal) goal.current = action.payload.current;
      })
      .addCase(removeGoalAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g.id !== action.payload);
      });
  },
});

export default goalsSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllGoals = (state) => state.goals.items;
export const selectGoalsByHobbyId = (hobbyId) => (state) =>
  state.goals.items.filter((g) => g.hobbyId === hobbyId);
export const selectGoalsStatus = (state) => state.goals.status;

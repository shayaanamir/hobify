import { createSlice } from '@reduxjs/toolkit';

// ─────────────────────────── MOCK DATA ────────────────────────────────────────
const MOCK_GOALS = [
  {
    id: 'g1',
    hobbyId: '1',
    type: 'weekly_hours',   // 'weekly_hours' | 'sessions_per_week' | 'streak_days'
    target: 5,
    current: 3.5,
    unit: 'hours',
  },
  {
    id: 'g2',
    hobbyId: '2',
    type: 'sessions_per_week',
    target: 7,
    current: 5,
    unit: 'sessions',
  },
  {
    id: 'g3',
    hobbyId: '3',
    type: 'streak_days',
    target: 10,
    current: 3,
    unit: 'days',
  },
];

// ─────────────────────────── SLICE ────────────────────────────────────────────
const goalsSlice = createSlice({
  name: 'goals',
  initialState: {
    items: MOCK_GOALS,
  },
  reducers: {
    /**
     * Add a new goal.
     * Payload: { hobbyId, type, target, current, unit }
     */
    addGoal: (state, action) => {
      const newGoal = {
        id: `g${Date.now()}`,
        current: 0,
        ...action.payload,
      };
      state.items.push(newGoal);
    },

    /**
     * Update goal progress (e.g. after logging a session).
     * Payload: { goalId, current }
     */
    updateGoalProgress: (state, action) => {
      const { goalId, current } = action.payload;
      const goal = state.items.find((g) => g.id === goalId);
      if (goal) {
        goal.current = current;
      }
    },

    /**
     * Remove a goal.
     * Payload: goalId (string)
     */
    removeGoal: (state, action) => {
      state.items = state.items.filter((g) => g.id !== action.payload);
    },
  },
});

export const { addGoal, updateGoalProgress, removeGoal } = goalsSlice.actions;
export default goalsSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllGoals = (state) => state.goals.items;

export const selectGoalsByHobbyId = (hobbyId) => (state) =>
  state.goals.items.filter((g) => g.hobbyId === hobbyId);

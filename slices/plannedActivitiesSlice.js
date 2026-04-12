import { createSlice } from '@reduxjs/toolkit';

// ─────────────────────────── MOCK DATA ────────────────────────────────────────
const today = new Date();

const MOCK_PLANNED = [
  {
    id: 'pa1',
    hobbyId: '1',
    title: 'Guitar practice — barre chords',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString(),
    duration: 45,
    completed: false,
  },
  {
    id: 'pa2',
    hobbyId: '3',
    title: 'Morning 5K run',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString(),
    duration: 30,
    completed: false,
  },
  {
    id: 'pa3',
    hobbyId: '2',
    title: 'Read Project Hail Mary ch. 6-8',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString(),
    duration: 60,
    completed: false,
  },
  {
    id: 'pa4',
    hobbyId: '5',
    title: 'Try a new pasta recipe',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString(),
    duration: 90,
    completed: false,
  },
  {
    id: 'pa5',
    hobbyId: '4',
    title: 'Painting session — still life',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(),
    duration: 60,
    completed: true,
  },
];

// ─────────────────────────── SLICE ────────────────────────────────────────────
const plannedActivitiesSlice = createSlice({
  name: 'plannedActivities',
  initialState: {
    items: MOCK_PLANNED,
  },
  reducers: {
    /**
     * Add a new planned activity.
     * Payload: { hobbyId, title, date, duration, notes? }
     */
    addPlannedActivity: (state, action) => {
      const newActivity = {
        id: `pa${Date.now()}`,
        completed: false,
        ...action.payload,
      };
      state.items.push(newActivity);
    },

    /**
     * Toggle the completed state of a planned activity.
     * Payload: id (string)
     */
    togglePlannedActivityComplete: (state, action) => {
      const activity = state.items.find((a) => a.id === action.payload);
      if (activity) {
        activity.completed = !activity.completed;
      }
    },

    /**
     * Remove a planned activity.
     * Payload: id (string)
     */
    removePlannedActivity: (state, action) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
  },
});

export const {
  addPlannedActivity,
  togglePlannedActivityComplete,
  removePlannedActivity,
} = plannedActivitiesSlice.actions;
export default plannedActivitiesSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllPlannedActivities = (state) => state.plannedActivities.items;

export const selectPlannedActivitiesByDate = (dateStr) => (state) =>
  state.plannedActivities.items.filter(
    (a) => new Date(a.date).toDateString() === new Date(dateStr).toDateString()
  );

export const selectUpcomingActivities = (state) => {
  const now = new Date();
  return state.plannedActivities.items
    .filter((a) => new Date(a.date) >= now && !a.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

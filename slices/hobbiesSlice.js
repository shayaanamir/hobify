import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'react-native-uuid';

// ─────────────────────────── MOCK DATA ────────────────────────────────────────
const MOCK_HOBBIES = [
  {
    id: '1',
    name: 'Guitar',
    icon: '🎸',
    color: '#F97066',
    category: 'Music',
    type: 'activity',
    streak: 5,
    totalHours: 42.5,
    totalSessions: 34,
    lastSessionDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '2',
    name: 'Reading',
    icon: '📚',
    color: '#2DD4BF',
    category: 'Learning',
    type: 'media',
    streak: 12,
    totalHours: 156,
    totalSessions: 89,
    lastSessionDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '3',
    name: 'Running',
    icon: '🏃',
    color: '#FBBF24',
    category: 'Sports',
    type: 'activity',
    streak: 3,
    totalHours: 28,
    totalSessions: 45,
    lastSessionDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '4',
    name: 'Painting',
    icon: '🎨',
    color: '#A78BFA',
    category: 'Creative',
    type: 'activity',
    streak: 0,
    totalHours: 12,
    totalSessions: 8,
    lastSessionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: '5',
    name: 'Cooking',
    icon: '🍳',
    color: '#34D399',
    category: 'Cooking',
    type: 'activity',
    streak: 2,
    totalHours: 65,
    totalSessions: 52,
    lastSessionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: '6',
    name: 'Gaming',
    icon: '🎮',
    color: '#818CF8',
    category: 'Other',
    type: 'media',
    streak: 4,
    totalHours: 85,
    totalSessions: 120,
    lastSessionDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: '7',
    name: 'Movies',
    icon: '🎬',
    color: '#FB7185',
    category: 'Other',
    type: 'media',
    streak: 1,
    totalHours: 45,
    totalSessions: 30,
    lastSessionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

// ─────────────────────────── SLICE ────────────────────────────────────────────
const hobbiesSlice = createSlice({
  name: 'hobbies',
  initialState: {
    items: MOCK_HOBBIES,
    selectedHobbyId: null,
  },
  reducers: {
    /**
     * Add a new hobby.
     * Payload: { name, icon, color, category, type }
     */
    addHobby: (state, action) => {
      const newHobby = {
        id: Date.now().toString(),
        streak: 0,
        totalHours: 0,
        totalSessions: 0,
        lastSessionDate: null,
        ...action.payload,
      };
      state.items.push(newHobby);
    },

    /**
     * Select / deselect a hobby for detail view.
     * Payload: string | null
     */
    selectHobby: (state, action) => {
      state.selectedHobbyId = action.payload;
    },

    /**
     * Called after a session is logged — updates totalHours, totalSessions,
     * lastSessionDate, and streak on the parent hobby.
     * Payload: { hobbyId, durationMinutes }
     */
    updateHobbyStats: (state, action) => {
      const { hobbyId, durationMinutes } = action.payload;
      const hobby = state.items.find((h) => h.id === hobbyId);
      if (!hobby) return;

      hobby.totalSessions += 1;
      hobby.totalHours = +(hobby.totalHours + durationMinutes / 60).toFixed(2);
      hobby.lastSessionDate = new Date().toISOString();

      // Simple streak bump — full streak logic lives in a selector/util
      hobby.streak += 1;
    },
  },
});

export const { addHobby, selectHobby, updateHobbyStats } = hobbiesSlice.actions;
export default hobbiesSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllHobbies = (state) => state.hobbies.items;
export const selectSelectedHobbyId = (state) => state.hobbies.selectedHobbyId;
export const selectHobbyById = (id) => (state) =>
  state.hobbies.items.find((h) => h.id === id);

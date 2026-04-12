import { createSlice } from '@reduxjs/toolkit';

// ─────────────────────────── MOCK DATA ────────────────────────────────────────
const MOCK_SESSIONS = [
  {
    id: 's1',
    hobbyId: '1',
    date: new Date().toISOString(),
    duration: 45,
    notes: 'Practiced scales and new song',
  },
  {
    id: 's2',
    hobbyId: '1',
    date: new Date(Date.now() - 86400000).toISOString(),
    duration: 30,
    notes: 'Fingerstyle exercises',
  },
  {
    id: 's3',
    hobbyId: '2',
    date: new Date().toISOString(),
    duration: 60,
    notes: 'Chapter 4-5 of Sci-Fi novel',
    mediaTitle: 'Project Hail Mary',
    rating: 4,
    status: 'in-progress',
  },
  {
    id: 's4',
    hobbyId: '3',
    date: new Date(Date.now() - 172800000).toISOString(),
    duration: 25,
    notes: 'Morning jog, light pace',
  },
  {
    id: 's5',
    hobbyId: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    duration: 120,
    notes: 'Finished the book!',
    mediaTitle: 'Dune',
    rating: 5,
    status: 'completed',
  },
  {
    id: 's6',
    hobbyId: '6',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    duration: 180,
    notes: 'Act 3 boss fight',
    mediaTitle: "Baldur's Gate 3",
    rating: 5,
    status: 'in-progress',
  },
  {
    id: 's7',
    hobbyId: '6',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    duration: 45,
    notes: 'Quick platforming session',
    mediaTitle: 'Celeste',
    rating: 4,
    status: 'completed',
  },
  {
    id: 's8',
    hobbyId: '7',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    duration: 180,
    notes: 'Mind blowing visuals',
    mediaTitle: 'Oppenheimer',
    rating: 5,
    status: 'completed',
  },
  {
    id: 's9',
    hobbyId: '7',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    duration: 105,
    notes: 'Beautiful story',
    mediaTitle: 'Past Lives',
    rating: 4,
    status: 'completed',
  },
  {
    id: 's10',
    hobbyId: '1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    duration: 60,
    notes: 'Learned new barre chords',
  },
  {
    id: 's11',
    hobbyId: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    duration: 40,
    notes: '5K personal best attempt',
  },
  {
    id: 's12',
    hobbyId: '5',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    duration: 90,
    notes: 'Made homemade pasta from scratch',
  },
];

// ─────────────────────────── SLICE ────────────────────────────────────────────
const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: {
    items: MOCK_SESSIONS,
    /**
     * selectedMediaTitle / selectedMediaHobbyId drive the Collection → Media
     * Detail navigation flow.
     */
    selectedMediaTitle: null,
    selectedMediaHobbyId: null,
  },
  reducers: {
    /**
     * Log a new session.
     * Payload: { hobbyId, date, duration, notes?, mediaTitle?, rating?, status? }
     */
    logSession: (state, action) => {
      const newSession = {
        id: `s${Date.now()}`,
        ...action.payload,
      };
      state.items.push(newSession);
    },

    /**
     * Select a media item so MediaDetailScreen can display it.
     * Payload: { title: string | null, hobbyId: string | null }
     */
    selectMedia: (state, action) => {
      state.selectedMediaTitle = action.payload.title;
      state.selectedMediaHobbyId = action.payload.hobbyId;
    },
  },
});

export const { logSession, selectMedia } = sessionsSlice.actions;
export default sessionsSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllSessions = (state) => state.sessions.items;

export const selectSessionsByHobbyId = (hobbyId) => (state) =>
  state.sessions.items.filter((s) => s.hobbyId === hobbyId);

/** Returns sessions for today only */
export const selectTodaySessions = (state) => {
  const today = new Date().toDateString();
  return state.sessions.items.filter(
    (s) => new Date(s.date).toDateString() === today
  );
};

export const selectSelectedMediaTitle = (state) => state.sessions.selectedMediaTitle;
export const selectSelectedMediaHobbyId = (state) => state.sessions.selectedMediaHobbyId;

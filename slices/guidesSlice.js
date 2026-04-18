import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { queryCollection, getDocument } from '../services/firestoreService';
import { arrayUnion, arrayRemove, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ─────────────────────────── ASYNC THUNKS ─────────────────────────────────────

export const fetchGuides = createAsyncThunk(
  'guides/fetchGuides',
  async (_, { rejectWithValue }) => {
    try {
      return await queryCollection('guides', [], {
        field: 'createdAt',
        direction: 'desc',
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleLikeGuideAsync = createAsyncThunk(
  'guides/toggleLikeGuideAsync',
  async ({ guideId, userId, isCurrentlyLiked }, { rejectWithValue }) => {
    try {
      const guideRef = doc(db, 'guides', guideId);
      if (isCurrentlyLiked) {
        await updateDoc(guideRef, {
          likedBy: arrayRemove(userId),
          likes: increment(-1),
        });
      } else {
        await updateDoc(guideRef, {
          likedBy: arrayUnion(userId),
          likes: increment(1),
        });
      }
      return { guideId, userId, isCurrentlyLiked };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────── SLICE ────────────────────────────────────────────
const guidesSlice = createSlice({
  name: 'guides',
  initialState: {
    items: [],
    selectedGuideId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    selectGuide: (state, action) => {
      state.selectedGuideId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuides.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGuides.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchGuides.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(toggleLikeGuideAsync.fulfilled, (state, action) => {
        const { guideId, userId, isCurrentlyLiked } = action.payload;
        const guide = state.items.find((g) => g.id === guideId);
        if (guide) {
          if (!guide.likedBy) guide.likedBy = [];
          if (isCurrentlyLiked) {
            guide.likedBy = guide.likedBy.filter(id => id !== userId);
            guide.likes = (guide.likes || 1) - 1;
          } else {
            guide.likedBy.push(userId);
            guide.likes = (guide.likes || 0) + 1;
          }
        }
      });
  },
});

export const { selectGuide } = guidesSlice.actions;
export default guidesSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllGuides = (state) => state.guides.items;
export const selectSelectedGuideId = (state) => state.guides.selectedGuideId;
export const selectGuideById = (id) => (state) =>
  state.guides.items.find((g) => g.id === id);
export const selectGuidesStatus = (state) => state.guides.status;

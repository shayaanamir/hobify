import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../firebaseConfig';
import {
  collection, doc,
  setDoc, deleteDoc,
  getDocs, query, where,
} from 'firebase/firestore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Doc ID for a follow relationship is "{followerId}_{followingId}" */
const followDocId = (followerId, followingId) => `${followerId}_${followingId}`;

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** Fetch all UIDs the given user is following */
export const fetchFollowing = createAsyncThunk(
  'follows/fetchFollowing',
  async (uid, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'follows'), where('followerId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data().followingId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Fetch all UIDs that follow the given user */
export const fetchFollowers = createAsyncThunk(
  'follows/fetchFollowers',
  async (uid, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'follows'), where('followingId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data().followerId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Follow a user */
export const followUserAsync = createAsyncThunk(
  'follows/followUser',
  async ({ followerId, followingId }, { rejectWithValue }) => {
    try {
      const docId = followDocId(followerId, followingId);
      await setDoc(doc(db, 'follows', docId), {
        followerId,
        followingId,
        createdAt: new Date().toISOString(),
      });
      return followingId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Unfollow a user */
export const unfollowUserAsync = createAsyncThunk(
  'follows/unfollowUser',
  async ({ followerId, followingId }, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'follows', followDocId(followerId, followingId)));
      return followingId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const followsSlice = createSlice({
  name: 'follows',
  initialState: {
    // UIDs that the current user follows
    following: [],
    // UIDs that follow the current user
    followers: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.following = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload;
      })
      .addCase(followUserAsync.fulfilled, (state, action) => {
        if (!state.following.includes(action.payload)) {
          state.following.push(action.payload);
        }
      })
      .addCase(unfollowUserAsync.fulfilled, (state, action) => {
        state.following = state.following.filter(id => id !== action.payload);
      });
  },
});

export default followsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectFollowing  = (state) => state.follows.following;
export const selectFollowers  = (state) => state.follows.followers;
export const selectIsFollowing = (uid) => (state) =>
  state.follows.following.includes(uid);

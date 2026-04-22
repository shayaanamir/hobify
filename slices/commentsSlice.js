import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addDocument,
  queryCollection,
} from '../services/firestoreService';

// ─────────────────────────── ASYNC THUNKS ─────────────────────────────────────

/** Fetch comments for a specific post */
export const fetchCommentsByPost = createAsyncThunk(
  'comments/fetchCommentsByPost',
  async (postId, { rejectWithValue }) => {
    try {
      return await queryCollection(
        'comments',
        [{ field: 'postId', op: '==', value: postId }]
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Add a comment to a post */
export const addCommentAsync = createAsyncThunk(
  'comments/addCommentAsync',
  async ({ postId, content, user }, { rejectWithValue }) => {
    try {
      const data = {
        postId,
        userId: user.uid,
        userName: user.name,
        userAvatar: user.avatar || null,
        userAvatarUrl: user.avatarUrl || null,
        content,
        createdAt: new Date().toISOString(),
      };
      const id = await addDocument('comments', data);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────── SLICE ────────────────────────────────────────────
const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsByPost.pending, (state) => {
        state.status = 'loading';
        state.items = []; // Clear current list while loading new post's comments
      })
      .addCase(fetchCommentsByPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCommentsByPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default commentsSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllComments = (state) => state.comments.items;
export const selectCommentsByPostId = (postId) => (state) =>
  state.comments.items.filter((c) => c.postId === postId);
export const selectCommentsStatus = (state) => state.comments.status;

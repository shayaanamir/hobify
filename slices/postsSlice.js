import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  queryCollection,
  updateDocument,
  getDocument,
  addDocument,
} from '../services/firestoreService';
import { arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ─────────────────────────── ASYNC THUNKS ─────────────────────────────────────

/** Fetch all posts (global — social feed) */
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      return await queryCollection('posts', [], { field: 'createdAt', direction: 'desc' });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Add a new post */
export const addPostAsync = createAsyncThunk(
  'posts/addPostAsync',
  async ({ userId, userName, userAvatar, post }, { rejectWithValue }) => {
    try {
      const newPost = {
        ...post,
        userId,
        userName,
        userAvatar,
        likes: 0,
        likedBy: [],
        commentCount: 0,
        createdAt: new Date().toISOString(),
      };
      const addedId = await addDocument('posts', newPost);
      return { id: addedId, ...newPost };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Toggle like on a post.
 * Uses Firestore arrayUnion/arrayRemove for atomic like tracking.
 */
export const toggleLikePostAsync = createAsyncThunk(
  'posts/toggleLikePostAsync',
  async ({ postId, userId, isCurrentlyLiked }, { rejectWithValue }) => {
    try {
      const postRef = doc(db, 'posts', postId);
      if (isCurrentlyLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(userId),
          likes: increment(-1),
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(userId),
          likes: increment(1),
        });
      }
      return { postId, userId, isCurrentlyLiked };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Increment comment count on a post */
export const incrementCommentCountAsync = createAsyncThunk(
  'posts/incrementCommentCountAsync',
  async ({ postId, currentCount }, { rejectWithValue }) => {
    try {
      await updateDocument('posts', postId, { commentCount: currentCount + 1 });
      return postId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────── SLICE ────────────────────────────────────────────
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    selectedPostId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    selectPost: (state, action) => {
      state.selectedPostId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addPostAsync.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(toggleLikePostAsync.fulfilled, (state, action) => {
        const { postId, userId, isCurrentlyLiked } = action.payload;
        const post = state.items.find((p) => p.id === postId);
        if (post) {
          if (!post.likedBy) post.likedBy = [];
          if (isCurrentlyLiked) {
            post.likedBy = post.likedBy.filter(id => id !== userId);
            post.likes -= 1;
          } else {
            post.likedBy.push(userId);
            post.likes += 1;
          }
        }
      })
      .addCase(incrementCommentCountAsync.fulfilled, (state, action) => {
        const post = state.items.find((p) => p.id === action.payload);
        if (post) post.commentCount += 1;
      });
  },
});

export const { selectPost } = postsSlice.actions;
export default postsSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllPosts = (state) => state.posts.items;
export const selectSelectedPostId = (state) => state.posts.selectedPostId;
export const selectPostById = (id) => (state) =>
  state.posts.items.find((p) => p.id === id);
export const selectPostsStatus = (state) => state.posts.status;

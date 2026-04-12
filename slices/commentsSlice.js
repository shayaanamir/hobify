import { createSlice } from '@reduxjs/toolkit';

// ─────────────────────────── MOCK DATA ────────────────────────────────────────
const MOCK_COMMENTS = [
  {
    id: 'c1',
    postId: 'p1',
    userId: 'u2',
    userName: 'Maya Johnson',
    userAvatar: '📖',
    content: "That's incredible! How long have you been playing total?",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'c2',
    postId: 'p1',
    userId: 'u3',
    userName: 'Jordan Park',
    userAvatar: '🏅',
    content: 'The section-by-section approach works so well. Congrats! 🎉',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'c3',
    postId: 'p1',
    userId: 'u5',
    userName: 'Taylor Kim',
    userAvatar: '🍳',
    content: 'Now do Eruption 😂',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'c4',
    postId: 'p2',
    userId: 'u1',
    userName: 'Alex Chen',
    userAvatar: '🎵',
    content: 'Try "The Name of the Wind" by Patrick Rothfuss! Amazing fantasy.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'c5',
    postId: 'p2',
    userId: 'u7',
    userName: 'Casey Brooks',
    userAvatar: '🎬',
    content: '50 books is insane! I can barely do 20 a year.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: 'c6',
    postId: 'p3',
    userId: 'u4',
    userName: 'Sam Rivera',
    userAvatar: '🎨',
    content: 'Keep it up! Week 6 is where it really starts clicking.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'c7',
    postId: 'p4',
    userId: 'u2',
    userName: 'Maya Johnson',
    userAvatar: '📖',
    content: 'That sky is gorgeous! Oils are so satisfying to work with.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'c8',
    postId: 'p5',
    userId: 'u6',
    userName: 'Riley Nguyen',
    userAvatar: '🎮',
    content: 'Those layers look PERFECT. How many folds did you do?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'c9',
    postId: 'p5',
    userId: 'u3',
    userName: 'Jordan Park',
    userAvatar: '🏅',
    content: "I tried this once and it was a disaster 😅 Yours look amazing!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'c10',
    postId: 'p6',
    userId: 'u7',
    userName: 'Casey Brooks',
    userAvatar: '🎬',
    content: 'Spiritfarer is beautiful and very chill. Highly recommend!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: 'c11',
    postId: 'p6',
    userId: 'u4',
    userName: 'Sam Rivera',
    userAvatar: '🎨',
    content: "A Short Hike is perfect for that. Takes about 2 hours and it's lovely.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
  {
    id: 'c12',
    postId: 'p7',
    userId: 'u5',
    userName: 'Taylor Kim',
    userAvatar: '🍳',
    content: 'The Holdovers was so underrated! Great picks.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
];

// ─────────────────────────── SLICE ────────────────────────────────────────────
const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    items: MOCK_COMMENTS,
  },
  reducers: {
    /**
     * Add a comment to a post.
     * Payload: { postId, content }
     * (userId / userName are hard-coded as "me" / the current user for now)
     */
    addComment: (state, action) => {
      const { postId, content } = action.payload;
      const newComment = {
        id: `c${Date.now()}`,
        postId,
        userId: 'me',
        userName: 'You',
        userAvatar: '😊',
        content,
        createdAt: new Date().toISOString(),
      };
      state.items.push(newComment);
    },
  },
});

export const { addComment } = commentsSlice.actions;
export default commentsSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllComments = (state) => state.comments.items;

export const selectCommentsByPostId = (postId) => (state) =>
  state.comments.items.filter((c) => c.postId === postId);

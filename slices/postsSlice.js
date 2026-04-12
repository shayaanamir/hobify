import { createSlice } from '@reduxjs/toolkit';

// ─────────────────────────── MOCK DATA ────────────────────────────────────────
const MOCK_POSTS = [
  {
    id: 'p1',
    userId: 'u1',
    userName: 'Alex Chen',
    userAvatar: '🎵',
    hobbyId: '1',
    type: 'achievement',
    title: 'Finally nailed Stairway to Heaven!',
    content:
      'After 3 months of practice, I can play the full solo without mistakes. The key was breaking it into 8-bar sections and drilling each one separately. So stoked right now! 🎸🔥',
    likes: 24,
    likedByMe: false,
    commentCount: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'p2',
    userId: 'u2',
    userName: 'Maya Johnson',
    userAvatar: '📖',
    hobbyId: '2',
    type: 'milestone',
    title: '50 books read this year!',
    content:
      'Hit my reading goal 2 months early. My favorites so far: Project Hail Mary, Tomorrow and Tomorrow and Tomorrow, and Piranesi. What should I read next?',
    likes: 42,
    likedByMe: true,
    commentCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'p3',
    userId: 'u3',
    userName: 'Jordan Park',
    userAvatar: '🏅',
    hobbyId: '3',
    type: 'progress',
    title: 'Week 6 of Couch to 5K',
    content:
      "Ran 25 minutes straight today without stopping! When I started I could barely do 60 seconds. Consistency really is everything. Keep going if you're just starting out!",
    likes: 18,
    likedByMe: false,
    commentCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'p4',
    userId: 'u4',
    userName: 'Sam Rivera',
    userAvatar: '🎨',
    hobbyId: '4',
    type: 'progress',
    title: 'My first oil painting attempt',
    content:
      "Switched from watercolors to oils and wow, the blending is so much more forgiving. Here's my first landscape — it's rough but I'm proud of the sky gradient.",
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop',
    likes: 31,
    likedByMe: false,
    commentCount: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: 'p5',
    userId: 'u5',
    userName: 'Taylor Kim',
    userAvatar: '🍳',
    hobbyId: '5',
    type: 'achievement',
    title: 'Made croissants from scratch!',
    content:
      'Took 2 days with all the folding and chilling but they turned out amazing. The lamination was actually visible! Pro tip: keep your butter COLD.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=300&fit=crop',
    likes: 56,
    likedByMe: true,
    commentCount: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'p6',
    userId: 'u6',
    userName: 'Riley Nguyen',
    userAvatar: '🎮',
    hobbyId: '6',
    type: 'question',
    title: 'Best cozy games for winding down?',
    content:
      "I've been playing too many intense games lately and need something relaxing before bed. Already played Stardew Valley and Animal Crossing. What else is out there?",
    likes: 15,
    likedByMe: false,
    commentCount: 9,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'p7',
    userId: 'u7',
    userName: 'Casey Brooks',
    userAvatar: '🎬',
    hobbyId: '7',
    type: 'milestone',
    title: '100 movies watched in 2024',
    content:
      "Just hit triple digits! My top 3 this year: Past Lives, Oppenheimer, and The Holdovers. Been tracking everything in Hobify and it's been great for keeping a log.",
    likes: 28,
    likedByMe: false,
    commentCount: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'p8',
    userId: 'u1',
    userName: 'Alex Chen',
    userAvatar: '🎵',
    hobbyId: '1',
    type: 'question',
    title: 'Acoustic vs Electric for beginners?',
    content:
      'My friend wants to start learning guitar and asked me for advice. I started on acoustic but I know many people recommend electric for easier fretting. What do you all think?',
    likes: 9,
    likedByMe: false,
    commentCount: 7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

// ─────────────────────────── SLICE ────────────────────────────────────────────
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: MOCK_POSTS,
    selectedPostId: null,
  },
  reducers: {
    /**
     * Toggle like on a post (optimistic update, no backend).
     * Payload: postId (string)
     */
    toggleLikePost: (state, action) => {
      const post = state.items.find((p) => p.id === action.payload);
      if (!post) return;
      post.likedByMe = !post.likedByMe;
      post.likes += post.likedByMe ? 1 : -1;
    },

    /**
     * Increment comment count when a new comment is added.
     * Payload: postId (string)
     */
    incrementCommentCount: (state, action) => {
      const post = state.items.find((p) => p.id === action.payload);
      if (post) post.commentCount += 1;
    },

    /**
     * Select a post for the PostDetailScreen.
     * Payload: postId (string | null)
     */
    selectPost: (state, action) => {
      state.selectedPostId = action.payload;
    },
  },
});

export const { toggleLikePost, incrementCommentCount, selectPost } = postsSlice.actions;
export default postsSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllPosts = (state) => state.posts.items;
export const selectSelectedPostId = (state) => state.posts.selectedPostId;
export const selectPostById = (id) => (state) =>
  state.posts.items.find((p) => p.id === id);

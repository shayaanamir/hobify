import { configureStore } from '@reduxjs/toolkit';
import hobbiesReducer from '../slices/hobbiesSlice';
import sessionsReducer from '../slices/sessionsSlice';
import goalsReducer from '../slices/goalsSlice';
import postsReducer from '../slices/postsSlice';
import commentsReducer from '../slices/commentsSlice';
import guidesReducer from '../slices/guidesSlice';
import plannedActivitiesReducer from '../slices/plannedActivitiesSlice';
import authReducer from '../slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hobbies: hobbiesReducer,
    sessions: sessionsReducer,
    goals: goalsReducer,
    posts: postsReducer,
    comments: commentsReducer,
    guides: guidesReducer,
    plannedActivities: plannedActivitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import hobbiesReducer from '../slices/hobbiesSlice';
import sessionsReducer from '../slices/sessionsSlice';
import goalsReducer from '../slices/goalsSlice';
import postsReducer from '../slices/postsSlice';
import commentsReducer from '../slices/commentsSlice';
import guidesReducer from '../slices/guidesSlice';
import plannedActivitiesReducer from '../slices/plannedActivitiesSlice';
import authReducer from '../slices/authSlice';
import followsReducer from '../slices/followsSlice';

const appReducer = combineReducers({
  auth: authReducer,
  hobbies: hobbiesReducer,
  sessions: sessionsReducer,
  goals: goalsReducer,
  posts: postsReducer,
  comments: commentsReducer,
  guides: guidesReducer,
  plannedActivities: plannedActivitiesReducer,
  follows: followsReducer,
});

const rootReducer = (state, action) => {
  // If the user logs out, we clear the entire state.
  // We use the full type string from auth/signOutThunk.
  if (action.type === 'auth/signOut/fulfilled' || action.type === 'auth/sessionExpired') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

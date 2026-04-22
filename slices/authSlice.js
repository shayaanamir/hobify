import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signUp,
  signIn,
  signOutUser,
  getUserProfile,
  updateUserProfile,
} from '../services/authService';

// ─────────────────────────── ASYNC THUNKS ─────────────────────────────────────

/** Sign up with email/password + name → creates Firestore profile */
export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      return await signUp(email, password, name);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Sign in with email/password → fetches Firestore profile */
export const signInUser = createAsyncThunk(
  'auth/signInUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await signIn(email, password);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Sign out */
export const signOutThunk = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await signOutUser();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Restore session — called when onAuthStateChanged fires with a user */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (firebaseUser, { rejectWithValue }) => {
    try {
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) return profile;
      return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        avatarUrl: null,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Update profile fields (name, bio, avatarUrl) */
export const updateProfileAsync = createAsyncThunk(
  'auth/updateProfileAsync',
  async ({ uid, updates }, { rejectWithValue }) => {
    try {
      return await updateUserProfile(uid, updates);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────── SLICE ────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
    user: null, // { uid, name, email, avatar }
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    isRestoringSession: true, // true until first auth check completes
  },
  reducers: {
    /** Clear any auth error */
    clearAuthError: (state) => {
      state.error = null;
    },
    /** Called when onAuthStateChanged fires with null (user signed out externally) */
    sessionExpired: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.isRestoringSession = false;
    },
    /** Mark session restore as complete (even if no user was found) */
    sessionCheckComplete: (state) => {
      state.isRestoringSession = false;
    },
  },
  extraReducers: (builder) => {
    // ── Sign Up ───────────────────────────────
    builder
      .addCase(signUpUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isLoggedIn = true;
        state.user = action.payload;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── Sign In ───────────────────────────────
    builder
      .addCase(signInUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isLoggedIn = true;
        state.user = action.payload;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── Sign Out ──────────────────────────────
    builder
      .addCase(signOutThunk.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.status = 'idle';
        state.isRestoringSession = false;
      });

    // ── Restore Session ───────────────────────
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.user = action.payload;
        state.isRestoringSession = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.isRestoringSession = false;
      });

    // ── Update Profile ────────────────────────
    builder
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { clearAuthError, sessionExpired, sessionCheckComplete } = authSlice.actions;
export default authSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectIsLoggedIn        = (state) => state.auth.isLoggedIn;
export const selectUser              = (state) => state.auth.user;
export const selectAuthStatus        = (state) => state.auth.status;
export const selectAuthError         = (state) => state.auth.error;
export const selectIsRestoringSession = (state) => state.auth.isRestoringSession;

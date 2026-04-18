// ─────────────────────────── Auth Service ─────────────────────────────────────
// Thin wrapper around Firebase Auth — keeps Firebase imports out of slices/screens.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// ── Email / Password ──────────────────────────────────────────────────────────

/**
 * Create a new account + write a user profile doc to Firestore.
 * Returns the user profile object.
 */
export async function signUp(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const profile = {
    uid: cred.user.uid,
    name,
    email,
    avatar: '😊',
    createdAt: new Date().toISOString(),
  };
  // Write to `users/{uid}`
  await setDoc(doc(db, 'users', cred.user.uid), profile);
  return profile;
}

/**
 * Sign in with existing email/password.
 * Returns the user profile from Firestore.
 */
export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return getUserProfile(cred.user.uid);
}

// ── Sign Out ──────────────────────────────────────────────────────────────────

export async function signOutUser() {
  await firebaseSignOut(auth);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fetch the user profile from Firestore. Returns null if not found.
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Subscribe to auth state changes.
 * `callback(user | null)` is called whenever the user signs in/out.
 * Returns an unsubscribe function.
 */
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

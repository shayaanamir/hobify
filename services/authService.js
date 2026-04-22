// ─────────────────────────── Auth Service ─────────────────────────────────────
// Thin wrapper around Firebase Auth — keeps Firebase imports out of slices/screens.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebaseConfig';

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

/**
 * Update a user's Firestore profile fields (name, bio, avatarUrl, etc.).
 * Merges the updates into the existing user doc.
 */
export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, 'users', uid), updates);
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.data();
}

/**
 * Upload a local image URI to Firebase Storage under avatars/{uid}.
 * Returns the public download URL.
 */
export async function uploadAvatarImage(uid, localUri) {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const avatarRef = ref(storage, `avatars/${uid}`);
  await uploadBytes(avatarRef, blob);
  return await getDownloadURL(avatarRef);
}

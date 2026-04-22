// ─────────────────────────── Auth Service ─────────────────────────────────────
// Thin wrapper around Firebase Auth — keeps Firebase imports out of slices/screens.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
    avatarUrl: null,  // Set when the user uploads a photo in EditProfile
    createdAt: new Date().toISOString(),
  };
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

// ── Cloudinary Image Upload ───────────────────────────────────────────────────

const CLOUDINARY_CLOUD_NAME = 'datnfawzo';      // ← your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'hobify_avatars';  // ← your unsigned upload preset

/**
 * Upload a local image URI to Cloudinary and return the secure URL.
 * Uses a stable public_id (avatars/{uid}) so re-uploads overwrite the old image.
 * An eager transformation auto-crops the image to a 400×400 face-centred square.
 *
 * @param {string} imageUri  Local file URI from expo-image-picker (file:// or content://)
 * @param {string} uid       Current user's UID — used to build a stable public_id
 * @returns {Promise<string>} Secure HTTPS URL of the processed avatar
 */
export async function uploadAvatarToCloudinary(imageUri, uid) {
  const formData = new FormData();

  // React Native / Expo accepts { uri, type, name } as a file blob
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: `avatar_${uid}.jpg`,
  });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('public_id', `avatars/${uid}`);
  // Note: eager, eager_async, and transformation params are NOT allowed
  // with unsigned uploads. We apply the crop via a delivery URL instead (see below).

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Cloudinary upload failed');
  }

  const data = await res.json();

  // Build a delivery URL with on-the-fly cropping (400×400, face-centred).
  // This is a free Cloudinary feature — no eager preset needed.
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/c_fill,g_face,h_400,w_400/<public_id>
  const publicId = data.public_id; // e.g. "avatars/uid123"
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,g_face,h_400,w_400/${publicId}`;
}
// ─────────────────────────── Firestore Service ────────────────────────────────
// Generic CRUD helpers for Firestore. All slice thunks go through here.

import {
  collection,
  doc,
  addDoc as fsAddDoc,
  setDoc as fsSetDoc,
  updateDoc as fsUpdateDoc,
  deleteDoc as fsDeleteDoc,
  getDoc as fsGetDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Add a document with an auto-generated ID.
 * Returns the new document ID.
 */
export async function addDocument(collectionName, data) {
  const ref = await fsAddDoc(collection(db, collectionName), data);
  return ref.id;
}

/**
 * Set a document with a specific ID (creates or overwrites).
 */
export async function setDocument(collectionName, docId, data) {
  await fsSetDoc(doc(db, collectionName, docId), data);
}

/**
 * Update specific fields on an existing document.
 */
export async function updateDocument(collectionName, docId, data) {
  await fsUpdateDoc(doc(db, collectionName, docId), data);
}

/**
 * Delete a document.
 */
export async function deleteDocument(collectionName, docId) {
  await fsDeleteDoc(doc(db, collectionName, docId));
}

/**
 * Get a single document by ID.
 * Returns the data with `id` field, or null if not found.
 */
export async function getDocument(collectionName, docId) {
  const snap = await fsGetDoc(doc(db, collectionName, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Query a collection with optional filters and ordering.
 *
 * @param {string}  collectionName
 * @param {Array}   filters   - Array of { field, op, value } objects
 * @param {Object}  [order]   - { field, direction: 'asc'|'desc' }
 * @returns {Array} Array of documents with `id` field included.
 */
export async function queryCollection(collectionName, filters = [], order = null) {
  const constraints = filters.map((f) => where(f.field, f.op, f.value));
  if (order) {
    constraints.push(orderBy(order.field, order.direction || 'asc'));
  }

  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

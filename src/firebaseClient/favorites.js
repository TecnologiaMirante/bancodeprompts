import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export async function getFavoritesByUser(uid) {
  if (!uid) return [];
  const q = query(collection(db, `users/${uid}/favorites`));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addFavorite(uid, promptId) {
  if (!uid) return;
  await addDoc(collection(db, `users/${uid}/favorites`), {
    promptId,
    favoritedAt: serverTimestamp(),
  });
}

export async function removeFavorite(uid, favoriteDocId) {
  if (!uid || !favoriteDocId) return;
  await deleteDoc(doc(db, `users/${uid}/favorites`, favoriteDocId));
}

export async function toggleFavorite(uid, promptId, existingFavoriteId) {
  if (!uid) return;
  if (existingFavoriteId) {
    await removeFavorite(uid, existingFavoriteId);
  } else {
    await addFavorite(uid, promptId);
  }
}

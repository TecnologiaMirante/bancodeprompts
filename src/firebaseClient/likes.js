import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

/** Toggle like: adds or removes. Returns true if now liked. */
export async function toggleLike(uid, promptId) {
  if (!uid || !promptId) return false;

  const likeRef  = doc(db, `users/${uid}/likes`, promptId);
  const promptRef = doc(db, "prompts", promptId);

  const snap = await getDoc(likeRef);
  if (snap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(promptRef, { likesCount: increment(-1) }).catch(() => null);
    return false;
  } else {
    await setDoc(likeRef, { promptId, likedAt: serverTimestamp() });
    await updateDoc(promptRef, { likesCount: increment(1) }).catch(() => null);
    return true;
  }
}

export async function getLikesByUser(uid) {
  if (!uid) return [];
  const snap = await getDocs(collection(db, `users/${uid}/likes`));
  return snap.docs.map((d) => d.id); // array of promptIds
}

export async function isLikedByUser(uid, promptId) {
  if (!uid || !promptId) return false;
  const snap = await getDoc(doc(db, `users/${uid}/likes`, promptId));
  return snap.exists();
}

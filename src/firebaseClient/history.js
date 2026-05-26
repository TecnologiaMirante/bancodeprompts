import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
  increment,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Records a copy event. Uses promptId as doc ID so subsequent copies
 * just update the timestamp and increment the count.
 */
export async function recordCopy(uid, promptId) {
  if (!uid || !promptId) return;
  const ref = doc(db, `users/${uid}/history`, promptId);
  await setDoc(
    ref,
    {
      promptId,
      copiedAt: serverTimestamp(),
      count: increment(1),
    },
    { merge: true }
  );
}

/** Returns history entries ordered by most recently copied. */
export async function getHistory(uid) {
  if (!uid) return [];
  const q = query(
    collection(db, `users/${uid}/history`),
    orderBy("copiedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function clearHistory(uid) {
  if (!uid) return;
  const snap = await getDocs(collection(db, `users/${uid}/history`));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

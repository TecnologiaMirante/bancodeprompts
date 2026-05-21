import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./config";

export async function registerPromptView(uid, promptId) {
  if (!uid || !promptId) return;
  const ref = doc(db, "user_stats", uid);
  const snap = await getDoc(ref);
  const today = new Date().toISOString().slice(0, 10);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      platform: {
        accessCount: 1,
        totalTimeSeconds: 0,
        lastAccess: serverTimestamp(),
        dailyAccesses: { [today]: 1 },
      },
      prompts: {
        [promptId]: { viewCount: 1, lastAccess: serverTimestamp() },
      },
    });
  } else {
    await updateDoc(ref, {
      "platform.accessCount": increment(1),
      "platform.lastAccess": serverTimestamp(),
      [`platform.dailyAccesses.${today}`]: increment(1),
      [`prompts.${promptId}.viewCount`]: increment(1),
      [`prompts.${promptId}.lastAccess`]: serverTimestamp(),
    });
  }
}

export async function addPlatformTime(uid, seconds) {
  if (!uid || seconds <= 0) return;
  const ref = doc(db, "user_stats", uid);
  await updateDoc(ref, {
    "platform.totalTimeSeconds": increment(seconds),
  }).catch(() => null);
}

export async function getStats() {
  const snap = await getDocs(collection(db, "user_stats"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

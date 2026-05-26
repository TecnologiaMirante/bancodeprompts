import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./config";

export async function getPrompts() {
  const q = query(collection(db, "prompts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPromptsBySector(sectorId) {
  const q = query(
    collection(db, "prompts"),
    where("sectorId", "==", sectorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPromptsByCategory(categoryId) {
  const q = query(
    collection(db, "prompts"),
    where("categoryId", "==", categoryId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPromptById(id) {
  const ref = doc(db, "prompts", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createPrompt(data, userProfile) {
  return await addDoc(collection(db, "prompts"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userProfile?.uid || "",
    createdByName: userProfile?.display_name || "",
    viewCount: 0,
    copyCount: 0,
    likesCount: 0,
  });
}

export async function updatePrompt(id, data, userProfile) {
  const ref = doc(db, "prompts", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userProfile?.uid || "",
    updatedByName: userProfile?.display_name || "",
  });
}

export async function deletePrompt(id) {
  await deleteDoc(doc(db, "prompts", id));
}

export async function incrementPromptView(id) {
  const ref = doc(db, "prompts", id);
  await updateDoc(ref, { viewCount: increment(1) }).catch(() => null);
}

export async function incrementPromptCopy(id) {
  const ref = doc(db, "prompts", id);
  await updateDoc(ref, { copyCount: increment(1) }).catch(() => null);
}

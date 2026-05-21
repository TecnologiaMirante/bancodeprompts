import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createUser(uid, data) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, {
    ...data,
    created_time: serverTimestamp(),
  });
}

export async function updateUser(uid, data) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
    updated_time: serverTimestamp(),
  });
}

export async function deleteUser(uid) {
  const ref = doc(db, "users", uid);
  await deleteDoc(ref);
}

export async function getUsers() {
  const q = query(collection(db, "users"), orderBy("created_time", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

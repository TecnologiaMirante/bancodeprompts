import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export async function getSectors() {
  const q = query(collection(db, "sectors"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createSector(data) {
  return await addDoc(collection(db, "sectors"), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function updateSector(id, data) {
  const ref = doc(db, "sectors", id);
  await updateDoc(ref, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteSector(id) {
  await deleteDoc(doc(db, "sectors", id));
}

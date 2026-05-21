import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export async function getCategories() {
  const q = query(collection(db, "categories"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCategoriesBySector(sectorId) {
  const q = query(
    collection(db, "categories"),
    where("sectorId", "==", sectorId),
    orderBy("name", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createCategory(data) {
  return await addDoc(collection(db, "categories"), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function updateCategory(id, data) {
  const ref = doc(db, "categories", id);
  await updateDoc(ref, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteCategory(id) {
  await deleteDoc(doc(db, "categories", id));
}

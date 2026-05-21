import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";

export const api = {
  categories: {
    list: async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  },
  prompts: {
    list: async () => {
      const q = query(collection(db, "prompts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  },
  favorites: {
    listByUser: async (userId) => {
      if (!userId) return [];
      const q = query(collection(db, `users/${userId}/favorites`));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    toggle: async (userId, promptId, existingFavoriteId) => {
      if (!userId) return;

      if (existingFavoriteId) {
        // Remove
        await deleteDoc(
          doc(db, `users/${userId}/favorites`, existingFavoriteId),
        );
      } else {
        // Adiciona
        await addDoc(collection(db, `users/${userId}/favorites`), {
          promptId,
          favoritedAt: new Date(),
        });
      }
    },
  },
};

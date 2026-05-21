export { db, auth, googleProvider } from "./config";
export { signInWithGoogle, logout } from "./auth";
export { getUserProfile, createUser, updateUser, deleteUser, getUsers } from "./users";
export { getSectors, createSector, updateSector, deleteSector } from "./sectors";
export { getCategories, getCategoriesBySector, createCategory, updateCategory, deleteCategory } from "./categories";
export {
  getPrompts,
  getPromptsBySector,
  getPromptsByCategory,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  incrementPromptView,
  incrementPromptCopy,
} from "./prompts";
export { getFavoritesByUser, addFavorite, removeFavorite, toggleFavorite } from "./favorites";
export { registerPromptView, addPlatformTime, getStats } from "./stats";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFavoritesByUser, toggleFavorite } from "../firebaseClient/favorites";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", uid],
    queryFn: () => getFavoritesByUser(uid),
    enabled: !!uid,
  });

  const toggleMutation = useMutation({
    mutationFn: async (promptId) => {
      if (!uid) {
        toast.error("Faça login para favoritar prompts.");
        return;
      }
      const existing = favorites.find((f) => f.promptId === promptId);
      await toggleFavorite(uid, promptId, existing?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", uid] });
    },
    onError: () => {
      toast.error("Erro ao atualizar favoritos.");
    },
  });

  const isFavorite = (promptId) =>
    favorites.some((f) => f.promptId === promptId);

  const toggle = (promptId) => toggleMutation.mutate(promptId);

  return { favorites, isFavorite, toggle };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLikesByUser, toggleLike } from "../firebaseClient/likes";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function useLikes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  const { data: likedIds = [] } = useQuery({
    queryKey: ["likes", uid],
    queryFn: () => getLikesByUser(uid),
    enabled: !!uid,
  });

  const toggleMutation = useMutation({
    mutationFn: async (promptId) => {
      if (!uid) {
        toast.error("Faça login para curtir prompts.");
        return;
      }
      return await toggleLike(uid, promptId);
    },
    onSuccess: (nowLiked) => {
      queryClient.invalidateQueries({ queryKey: ["likes", uid] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      if (nowLiked !== undefined) {
        toast.success(nowLiked ? "Prompt curtido!" : "Curtida removida.");
      }
    },
    onError: () => toast.error("Erro ao curtir prompt."),
  });

  const isLiked    = (promptId) => likedIds.includes(promptId);
  const toggle     = (promptId) => toggleMutation.mutate(promptId);

  return { likedIds, isLiked, toggle };
}

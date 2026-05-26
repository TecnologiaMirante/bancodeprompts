import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHistory, recordCopy, clearHistory } from "../firebaseClient/history";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function useHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["history", uid],
    queryFn: () => getHistory(uid),
    enabled: !!uid,
  });

  const recordMutation = useMutation({
    mutationFn: ({ promptId }) => recordCopy(uid, promptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", uid] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => clearHistory(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", uid] });
      toast.success("Histórico apagado.");
    },
    onError: () => toast.error("Erro ao apagar histórico."),
  });

  const record = (promptId) => {
    if (uid) recordMutation.mutate({ promptId });
  };

  const clear = () => clearMutation.mutate();

  return { history, isLoading, record, clear };
}

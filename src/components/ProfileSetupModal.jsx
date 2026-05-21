import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSectors } from "../firebaseClient/sectors";
import { updateUser } from "../firebaseClient/users";
import { toast } from "sonner";

export default function ProfileSetupModal() {
  const { user, needsSectorSetup, refreshProfile } = useAuth();
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: sectors = [], isLoading: loadingSectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: getSectors,
    enabled: !!needsSectorSetup,
  });

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      await updateUser(user.uid, {
        sectorIds: selected,
        sectorId: selected[0],
      });
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      toast.success("Setor definido com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar setor. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await updateUser(user.uid, { sectorIds: [], sectorId: "__skipped__" });
      await refreshProfile();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao pular. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (!needsSectorSetup) return null;

  const noSectors = !loadingSectors && sectors.length === 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-background rounded-2xl border border-border shadow-premium p-8 z-10"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Layers className="w-6 h-6 text-primary" />
          </div>

          <h2 className="text-xl font-bold tracking-tight mb-1">
            Defina seu setor
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Selecione o(s) setor(es) que correspondem à sua área de atuação.
            Você verá apenas os prompts dos setores selecionados.
          </p>

          {/* Loading skeleton */}
          {loadingSectors && (
            <div className="grid grid-cols-2 gap-2 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-surface animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {noSectors && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl mb-8">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Nenhum setor cadastrado
                </p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5 leading-relaxed">
                  Um administrador precisa criar os setores antes. Você pode
                  pular por enquanto e configurar depois.
                </p>
              </div>
            </div>
          )}

          {/* Sectors grid */}
          {!loadingSectors && sectors.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-8">
              {sectors.map((sector) => {
                const isSelected = selected.includes(sector.id);
                return (
                  <button
                    key={sector.id}
                    onClick={() => toggle(sector.id)}
                    className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/6 text-primary"
                        : "border-border bg-surface hover:border-border/80 hover:bg-surface text-foreground"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary absolute top-2.5 right-2.5 shrink-0" />
                    )}
                    <span className="text-base leading-none">
                      {sector.icon || "📁"}
                    </span>
                    <span className="truncate pr-4">{sector.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* CTA */}
          {!loadingSectors && (
            <div className="space-y-2">
              {sectors.length > 0 && (
                <button
                  onClick={handleSave}
                  disabled={!selected.length || saving}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        Confirmar setor{selected.length > 1 ? "es" : ""}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleSkip}
                disabled={saving}
                className="w-full flex items-center justify-center h-10 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-50"
              >
                Pular por enquanto
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

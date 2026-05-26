import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, X, Trash2, Download, Copy } from "lucide-react";
import { useHistory }  from "../hooks/useHistory";
import { getPrompts }  from "../firebaseClient/prompts";
import { getCategories } from "../firebaseClient/categories";
import { getSectors }    from "../firebaseClient/sectors";
import PromptGrid from "../components/prompts/PromptGrid";
import { ConfirmModal } from "../components/ui/confirm-modal";
import { toast } from "sonner";

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-md" />
        <div className="skeleton h-5 w-14 rounded-md" />
      </div>
      <div className="skeleton h-4 w-full rounded-md" />
      <div className="skeleton h-4 w-4/5 rounded-md" />
      <div className="skeleton h-3 w-full rounded-md mt-2" />
      <div className="skeleton h-3 w-3/4 rounded-md" />
    </div>
  );
}

function exportHistoryTxt(prompts, sectors, categories) {
  if (!prompts.length) { toast.error("Nenhum prompt para exportar."); return; }

  const lines = [
    `BANCO DE PROMPTS — TV MIRANTE`,
    `HISTÓRICO DE CÓPIAS`,
    `${"=".repeat(50)}`,
    `Exportado em: ${new Date().toLocaleString("pt-BR")}`,
    `Total: ${prompts.length} prompt${prompts.length !== 1 ? "s" : ""}`,
    ``,
  ];

  prompts.forEach((p, i) => {
    const sectorIds   = p.sectorIds?.length ? p.sectorIds : p.sectorId ? [p.sectorId] : [];
    const categoryIds = p.categoryIds?.length ? p.categoryIds : p.categoryId ? [p.categoryId] : [];
    const sectorNames   = sectorIds.map((id) => sectors.find((s) => s.id === id)?.name).filter(Boolean).join(", ") || "—";
    const categoryNames = categoryIds.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean).join(", ") || "—";

    lines.push(`${i + 1}. ${p.title || "Sem título"}`);
    lines.push(`   Setor: ${sectorNames}  |  Categoria: ${categoryNames}  |  IA: ${p.ai_model || "—"}`);
    lines.push(`${"─".repeat(50)}`);
    lines.push(p.content || "(conteúdo não disponível)");
    lines.push(``);
    lines.push(``);
  });

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), {
    href: url,
    download: `historico-prompts-${new Date().toISOString().slice(0,10)}.txt`,
  });
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Histórico exportado!");
}

export default function HistoryPage() {
  const { history, isLoading: historyLoading, clear } = useHistory();
  const [search, setSearch] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const { data: prompts    = [], isLoading: promptsLoading } = useQuery({ queryKey: ["prompts"],    queryFn: getPrompts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: sectors    = [] } = useQuery({ queryKey: ["sectors"],    queryFn: getSectors });

  const isLoading = historyLoading || promptsLoading;

  // Order prompts by history copy date
  const historyPrompts = history
    .map((h) => {
      const p = prompts.find((p) => p.id === h.promptId);
      return p ? { ...p, _copiedAt: h.copiedAt, _copyCount: h.count } : null;
    })
    .filter(Boolean);

  const filtered = historyPrompts.filter(
    (p) =>
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.short_description?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleClear = async () => {
    setClearing(true);
    try { await clear(); }
    finally { setClearing(false); setShowClearConfirm(false); }
  };

  const handleExport = () => exportHistoryTxt(filtered.length ? filtered : historyPrompts, sectors, categories);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Histórico de cópias</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Carregando…"
                : `${historyPrompts.length} prompt${historyPrompts.length !== 1 ? "s" : ""} copiado${historyPrompts.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {!isLoading && historyPrompts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="cursor-pointer inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar .txt
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="cursor-pointer inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        {!isLoading && historyPrompts.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar no histórico…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-10 pr-9 border border-border rounded-xl text-sm bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-[3px] focus:ring-ring/30 focus:border-ring transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            <PromptGrid
              key={search}
              prompts={filtered}
              categories={categories}
              sectors={sectors}
              emptyMessage={
                search
                  ? `Nenhum resultado para "${search}".`
                  : "Você ainda não copiou nenhum prompt."
              }
            />
          </AnimatePresence>
        )}

        {/* Result count */}
        {!isLoading && search && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {filtered.length} de {historyPrompts.length} no histórico
          </p>
        )}
      </motion.div>

      {/* Confirm clear */}
      <ConfirmModal
        open={showClearConfirm}
        title="Limpar histórico"
        description="Todo o seu histórico de cópias será apagado. Essa ação não pode ser desfeita."
        confirmLabel="Limpar tudo"
        cancelLabel="Cancelar"
        variant="danger"
        loading={clearing}
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

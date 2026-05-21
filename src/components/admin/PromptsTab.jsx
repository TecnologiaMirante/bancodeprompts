import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { deletePrompt, updatePrompt } from "../../firebaseClient/prompts";
import AiBadge from "../prompts/AiBadge";
import DifficultyBadge from "../prompts/DifficultyBadge";
import PromptEditorModal from "./PromptEditorModal";
import { ConfirmModal } from "../ui/confirm-modal";
import SearchBar, { applySortFn } from "../prompts/SearchBar";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function PromptsTab({ prompts, setPrompts, categories, sectors }) {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAIs, setSelectedAIs] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("alpha-asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const promptSectorIds = p.sectorIds?.length ? p.sectorIds : p.sectorId ? [p.sectorId] : [];
      const promptCategoryIds = p.categoryIds?.length
        ? p.categoryIds
        : p.categoryId || p.category_id
          ? [p.categoryId || p.category_id]
          : [];

      const matchesSearch =
        !searchTerm ||
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAI = selectedAIs.length === 0 || selectedAIs.includes(p.ai_model);
      const matchesDifficulty =
        selectedDifficulties.length === 0 || selectedDifficulties.includes(p.difficulty);
      const matchesSector =
        selectedSectors.length === 0 || selectedSectors.some((id) => promptSectorIds.includes(id));
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((id) => promptCategoryIds.includes(id));

      return matchesSearch && matchesAI && matchesDifficulty && matchesSector && matchesCategory;
    });
  }, [prompts, searchTerm, selectedAIs, selectedDifficulties, selectedSectors, selectedCategories]);

  const sorted = useMemo(() => [...filtered].sort(applySortFn(sortBy)), [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedAIs, selectedDifficulties, selectedSectors, selectedCategories]);

  // Auto-clear categories that no longer belong to selected sectors
  useEffect(() => {
    if (selectedSectors.length > 0 && selectedCategories.length > 0) {
      const valid = selectedCategories.filter((cid) => {
        const cat = categories.find((c) => c.id === cid);
        return !cat || selectedSectors.includes(cat.sectorId);
      });
      if (valid.length !== selectedCategories.length) setSelectedCategories(valid);
    }
  }, [selectedSectors, categories]);

  const getCategoryNames = (p) => {
    const ids = p.categoryIds?.length ? p.categoryIds : p.categoryId || p.category_id ? [p.categoryId || p.category_id] : [];
    return ids.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean).join(", ") || "—";
  };
  const getSectorNames = (p) => {
    const ids = p.sectorIds?.length ? p.sectorIds : p.sectorId ? [p.sectorId] : [];
    return ids.map((id) => sectors.find((s) => s.id === id)?.name).filter(Boolean).join(", ") || "—";
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePrompt(deleteTarget);
      setPrompts((prev) => prev.filter((p) => p.id !== deleteTarget));
      toast.success("Prompt excluído.");
    } catch {
      toast.error("Erro ao excluir prompt.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleFeatured = async (prompt) => {
    try {
      await updatePrompt(prompt.id, { is_featured: !prompt.is_featured }, userProfile);
      setPrompts((prev) =>
        prev.map((p) => (p.id === prompt.id ? { ...p, is_featured: !p.is_featured } : p)),
      );
      toast.success(prompt.is_featured ? "Destaque removido." : "Prompt destacado!");
    } catch {
      toast.error("Erro ao atualizar.");
    }
  };

  const handleSaved = (prompt, isNew) => {
    if (isNew) {
      setPrompts((prev) => [prompt, ...prev]);
    } else {
      setPrompts((prev) => prev.map((p) => (p.id === prompt.id ? prompt : p)));
    }
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Prompts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filtered.length === prompts.length
              ? `${prompts.length} prompt${prompts.length !== 1 ? "s" : ""} no total`
              : `${filtered.length} de ${prompts.length} prompts`}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="cursor-pointer flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo prompt</span>
        </button>
      </div>

      {/* Filter bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedAIs={selectedAIs}
        onAIsChange={setSelectedAIs}
        selectedDifficulties={selectedDifficulties}
        onDifficultiesChange={setSelectedDifficulties}
        selectedSectors={selectedSectors}
        onSectorsChange={setSelectedSectors}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        sectors={sectors}
        categories={categories}
        prompts={prompts}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/60">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  Título
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell whitespace-nowrap">
                  IA
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell whitespace-nowrap">
                  Nível
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell whitespace-nowrap">
                  Setor
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Views
                  </span>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Cópias
                  </span>
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Nenhum prompt encontrado.
                  </td>
                </tr>
              ) : (
                paginated.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-surface/40 transition-colors">
                    <td className="px-4 py-3 max-w-50">
                      <div className="flex items-center gap-2">
                        {prompt.is_featured && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                        <span className="font-medium text-foreground truncate text-sm">
                          {prompt.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {prompt.ai_model && <AiBadge ai={prompt.ai_model} />}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {prompt.difficulty && <DifficultyBadge difficulty={prompt.difficulty} />}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                      <span className="truncate max-w-32 block">{getSectorNames(prompt)}</span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                      {(prompt.viewCount || 0).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                      {(prompt.copyCount || 0).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleFeatured(prompt)}
                          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                            prompt.is_featured
                              ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                              : "text-muted-foreground hover:text-amber-500 hover:bg-surface"
                          }`}
                          title={prompt.is_featured ? "Remover destaque" : "Destacar"}
                        >
                          {!prompt.is_featured ? (
                            <StarOff className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          ) : (
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditing(prompt)}
                          className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(prompt.id)}
                          className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages} · {sorted.length} prompts
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {arr[i - 1] && p - arr[i - 1] > 1 && (
                    <span className="text-xs text-muted-foreground px-1">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
                      p === page
                        ? "bg-primary text-primary-foreground font-medium"
                        : "border border-border text-muted-foreground hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {(creating || editing) && (
        <PromptEditorModal
          prompt={editing}
          categories={categories}
          sectors={sectors}
          onSaved={handleSaved}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir prompt"
        description="Esta ação não pode ser desfeita. O prompt será removido permanentemente."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, FileText, ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../firebaseClient/categories";
import { Button } from "../ui/button";
import { ConfirmModal } from "../ui/confirm-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

const PAGE_SIZE = 12;

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6",
];

const EMPTY = { name: "", sectorId: "", color: "#6366f1" };

/* ── Info icon SVG ───────────────────────────────────────────── */
function InfoIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/* ── Category prompts popover ────────────────────────────────── */
function CategoryPopover({ category, prompts, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const catPrompts = prompts.filter((p) => {
    const ids = p.categoryIds?.length
      ? p.categoryIds
      : p.categoryId || p.category_id
        ? [p.categoryId || p.category_id]
        : [];
    return ids.includes(category.id);
  });

  const visible = catPrompts.slice(0, 8);
  const remaining = catPrompts.length - visible.length;

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className="absolute left-0 top-full mt-2 z-50 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/60">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: category.color || "#6366f1" }}
          />
          <p className="text-xs font-bold text-foreground">{category.name}</p>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Prompt list */}
      <div className="max-h-64 overflow-y-auto">
        <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Prompts ({catPrompts.length})
        </p>
        {catPrompts.length === 0 ? (
          <p className="px-4 pb-3 text-[11px] text-muted-foreground italic">
            Nenhum prompt nesta categoria.
          </p>
        ) : (
          <div className="pb-2">
            {visible.map((p) => (
              <div key={p.id} className="px-4 py-1.5 flex items-start gap-2 hover:bg-surface/60">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: category.color || "#6366f1" }} />
                <p className="text-xs text-foreground leading-snug line-clamp-2">{p.title}</p>
              </div>
            ))}
            {remaining > 0 && (
              <p className="px-4 pt-1 text-[10px] text-muted-foreground/60 italic">
                e mais {remaining} prompt{remaining !== 1 ? "s" : ""}…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function CategoriesTab({ categories, setCategories, sectors, prompts = [] }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [filterSector, setFilterSector] = useState("__all__");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeInfoId, setActiveInfoId] = useState(null);

  const startCreate = () => {
    setForm(EMPTY);
    setCreating(true);
    setEditing(null);
    setActiveInfoId(null);
  };

  const startEdit = (cat) => {
    setForm({ name: cat.name, sectorId: cat.sectorId || "", color: cat.color || "#6366f1" });
    setEditing(cat);
    setCreating(false);
    setActiveInfoId(null);
  };

  const cancel = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.warning("Nome é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      if (creating) {
        const ref = await createCategory(form);
        setCategories((prev) => [...prev, { id: ref.id, ...form }]);
        toast.success("Categoria criada.");
      } else {
        await updateCategory(editing.id, form);
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...c, ...form } : c)),
        );
        toast.success("Categoria atualizada.");
      }
      cancel();
    } catch {
      toast.error("Erro ao salvar categoria.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget));
      toast.success("Categoria excluída.");
    } catch {
      toast.error("Erro ao excluir categoria.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getSectorName = (id) => sectors.find((s) => s.id === id)?.name || "—";

  const getPromptCount = (categoryId) =>
    prompts.filter((p) => {
      const ids = p.categoryIds?.length
        ? p.categoryIds
        : p.categoryId || p.category_id
          ? [p.categoryId || p.category_id]
          : [];
      return ids.includes(categoryId);
    }).length;

  const filtered = useMemo(() => {
    let list = categories;
    if (filterSector === "__none__") list = list.filter((c) => !c.sectorId);
    else if (filterSector !== "__all__") list = list.filter((c) => c.sectorId === filterSector);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [categories, filterSector, searchTerm]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (v) => {
    setFilterSector(v);
    setPage(1);
  };

  const handleSearchChange = (v) => {
    setSearchTerm(v);
    setPage(1);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Categorias</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filtered.length === categories.length
              ? `${categories.length} categoria${categories.length !== 1 ? "s" : ""} cadastrada${categories.length !== 1 ? "s" : ""}`
              : `${filtered.length} de ${categories.length} categorias`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sectors.length > 0 && (
            <Select value={filterSector} onValueChange={handleFilterChange}>
              <SelectTrigger className="h-8 text-xs w-36 cursor-pointer">
                <SelectValue placeholder="Todos setores" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="__all__" className="cursor-pointer">Todos setores</SelectItem>
                <SelectItem value="__none__" className="cursor-pointer">Sem setor</SelectItem>
                {sectors.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="cursor-pointer">
                    {s.icon && <span className="mr-1">{s.icon}</span>}
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={startCreate} size="sm">
            <Plus className="w-4 h-4" />
            Nova categoria
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full h-9 pl-10 pr-9 border border-border rounded-xl text-sm bg-transparent placeholder:text-muted-foreground/60 focus:outline-none focus:ring-[3px] focus:ring-ring/30 focus:border-ring transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange("")}
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Form */}
      {(creating || editing) && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {creating ? "Nova categoria" : `Editar: ${editing?.name}`}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nome *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome da categoria"
                className="w-full h-9 px-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Setor</label>
              <Select
                value={form.sectorId || "__none__"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, sectorId: v === "__none__" ? "" : v }))
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Sem setor" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="__none__" className="cursor-pointer">Sem setor</SelectItem>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="cursor-pointer">
                      {s.icon && <span>{s.icon}</span>}
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Cor</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`cursor-pointer w-7 h-7 rounded-full transition-all ${
                    form.color === c ? "ring-2 ring-offset-2 ring-foreground/30 scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? (
                <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Salvar
            </Button>
            <Button onClick={cancel} variant="outline" size="sm">
              <X className="w-3.5 h-3.5" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
        {paginated.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {searchTerm ? `Nenhuma categoria para "${searchTerm}".` : "Nenhuma categoria encontrada."}
          </div>
        ) : (
          paginated.map((cat) => {
            const pCount = getPromptCount(cat.id);
            const isInfoOpen = activeInfoId === cat.id;

            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface/50 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || "#6366f1" }}
                />

                {/* Name + info + popover */}
                <div className="flex-1 min-w-0 relative">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{cat.name}</span>

                    {/* Info button */}
                    <button
                      onClick={() => setActiveInfoId(isInfoOpen ? null : cat.id)}
                      className={`cursor-pointer shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isInfoOpen
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                      title="Ver prompts desta categoria"
                    >
                      <InfoIcon />
                    </button>
                  </div>

                  {cat.sectorId && (
                    <span className="text-[10px] text-muted-foreground">{getSectorName(cat.sectorId)}</span>
                  )}

                  {/* Popover */}
                  {isInfoOpen && (
                    <CategoryPopover
                      category={cat}
                      prompts={prompts}
                      onClose={() => setActiveInfoId(null)}
                    />
                  )}
                </div>

                {/* Prompt count chip */}
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface border border-border text-muted-foreground mr-1 shrink-0"
                  title={`${pCount} prompt${pCount !== 1 ? "s" : ""}`}
                >
                  <FileText className="w-2.5 h-2.5" />
                  {pCount}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(cat)}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat.id)}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {arr[i - 1] && p - arr[i - 1] > 1 && (
                    <span className="text-xs text-muted-foreground px-0.5">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${
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
              className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir categoria"
        description="Esta ação não pode ser desfeita. A categoria será removida permanentemente."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

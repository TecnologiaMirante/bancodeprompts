import { useRef, useEffect, useState, useMemo } from "react";
import { Search, X, Check, ChevronDown, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AI_OPTIONS = [
  { value: "ChatGPT", label: "ChatGPT" },
  { value: "Claude", label: "Claude" },
  { value: "Gemini", label: "Gemini" },
  { value: "Perplexity", label: "Perplexity" },
  { value: "DeepSeek", label: "DeepSeek" },
  { value: "Copilot", label: "Copilot" },
];

const DIFFICULTY_OPTIONS = [
  { value: "Iniciante", label: "Iniciante" },
  { value: "Intermediário", label: "Intermediário" },
  { value: "Avançado", label: "Avançado" },
];

export const SORT_OPTIONS = [
  { value: "alpha-asc", label: "A → Z" },
  { value: "alpha-desc", label: "Z → A" },
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "most-viewed", label: "Mais vistos" },
  { value: "most-copied", label: "Mais copiados" },
];

export function applySortFn(sortBy) {
  return {
    "alpha-asc": (a, b) => (a.title || "").localeCompare(b.title || "", "pt-BR"),
    "alpha-desc": (a, b) => (b.title || "").localeCompare(a.title || "", "pt-BR"),
    newest: (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
    oldest: (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
    "most-viewed": (a, b) => (b.viewCount || 0) - (a.viewCount || 0),
    "most-copied": (a, b) => (b.copyCount || 0) - (a.copyCount || 0),
  }[sortBy] || ((a, b) => (a.title || "").localeCompare(b.title || "", "pt-BR"));
}

/* ── Helpers ─────────────────────────────────────────────────── */
function getSectorIds(p) {
  return p.sectorIds?.length ? p.sectorIds : p.sectorId ? [p.sectorId] : [];
}
function getCategoryIds(p) {
  return p.categoryIds?.length
    ? p.categoryIds
    : p.categoryId || p.category_id
      ? [p.categoryId || p.category_id]
      : [];
}

/**
 * Returns prompts that match all filters EXCEPT the given `exclude` dimension.
 * Used to compute cross-filtered facet counts.
 */
function filterExcluding(prompts, { searchTerm, selectedAIs, selectedDifficulties, selectedSectors, selectedCategories, exclude }) {
  return prompts.filter((p) => {
    if (
      searchTerm &&
      !p.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !p.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) return false;

    if (exclude !== "ai" && selectedAIs.length > 0 && !selectedAIs.includes(p.ai_model)) return false;

    if (exclude !== "difficulty" && selectedDifficulties.length > 0 && !selectedDifficulties.includes(p.difficulty)) return false;

    if (exclude !== "sector" && selectedSectors.length > 0) {
      const ids = getSectorIds(p);
      if (!selectedSectors.some((id) => ids.includes(id))) return false;
    }

    if (exclude !== "category" && selectedCategories.length > 0) {
      const ids = getCategoryIds(p);
      if (!selectedCategories.some((id) => ids.includes(id))) return false;
    }

    return true;
  });
}

/* ── MultiSelectDropdown ─────────────────────────────────────── */
function MultiSelectDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = selected.length > 0;
  const allSelected = options.length > 0 && options.every((o) => selected.includes(o.value));

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : options.map((o) => o.value));
  };

  const buttonLabel = () => {
    if (selected.length === 0) return label;
    if (selected.length === 1) {
      return options.find((o) => o.value === selected[0])?.label ?? label;
    }
    return `${label} (${selected.length})`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`cursor-pointer flex items-center gap-1.5 h-9 px-3.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
          isActive
            ? "border-primary/40 bg-primary/8 text-primary"
            : "border-border bg-background text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="max-w-28 truncate">{buttonLabel()}</span>
        {isActive ? (
          <X
            className="w-3 h-3 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
              setOpen(false);
            }}
          />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute top-full left-0 mt-1.5 min-w-48 rounded-xl border border-border bg-popover shadow-premium py-1.5 z-50 max-h-60 overflow-y-auto"
          >
            {options.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground text-center">
                Nenhuma opção disponível
              </p>
            ) : (
              <>
                {options.map((opt) => {
                  const checked = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggle(opt.value)}
                      className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-foreground hover:bg-surface transition-colors text-left"
                    >
                      <span
                        className={`flex items-center justify-center w-3.5 h-3.5 rounded border transition-all shrink-0 ${
                          checked ? "bg-primary border-primary" : "border-border"
                        }`}
                      >
                        {checked && <Check className="w-2.5 h-2.5 text-white" />}
                      </span>
                      {opt.icon && <span className="text-sm">{opt.icon}</span>}
                      <span className={`flex-1 truncate ${checked ? "text-primary font-medium" : ""}`}>
                        {opt.label}
                      </span>
                      {opt.count !== undefined && (
                        <span className={`text-[10px] font-medium shrink-0 tabular-nums ${
                          checked ? "text-primary/70" : "text-muted-foreground/50"
                        }`}>
                          {opt.count}
                        </span>
                      )}
                    </button>
                  );
                })}
                {options.length > 1 && (
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={toggleAll}
                      className="cursor-pointer w-full px-3 py-1.5 text-xs text-primary hover:bg-surface transition-colors text-left font-medium"
                    >
                      {allSelected ? "Desmarcar todos" : "Marcar todos"}
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── SortDropdown ────────────────────────────────────────────── */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = SORT_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
      >
        <ArrowUpDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
        <span>{selected?.label ?? "Ordenar"}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute top-full right-0 mt-1.5 min-w-44 rounded-xl border border-border bg-popover shadow-premium py-1.5 z-50"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="cursor-pointer w-full flex items-center justify-between gap-3 px-3 py-1.5 text-sm text-foreground hover:bg-surface transition-colors text-left"
              >
                <span className={value === opt.value ? "text-primary font-medium" : ""}>
                  {opt.label}
                </span>
                {value === opt.value && (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── SearchBar ───────────────────────────────────────────────── */
export default function SearchBar({
  searchTerm,
  onSearchChange,
  selectedAIs = [],
  onAIsChange,
  selectedDifficulties = [],
  onDifficultiesChange,
  selectedSectors = [],
  onSectorsChange,
  selectedCategories = [],
  onCategoriesChange,
  sectors = [],
  categories = [],
  prompts = [],
  sortBy = "alpha-asc",
  onSortChange,
  onClearAll,
}) {
  // Cross-filtered counts — each dimension excludes its own filter
  const facets = useMemo(() => {
    const ctx = { searchTerm, selectedAIs, selectedDifficulties, selectedSectors, selectedCategories };

    const forAI       = filterExcluding(prompts, { ...ctx, exclude: "ai" });
    const forDiff     = filterExcluding(prompts, { ...ctx, exclude: "difficulty" });
    const forSector   = filterExcluding(prompts, { ...ctx, exclude: "sector" });
    const forCategory = filterExcluding(prompts, { ...ctx, exclude: "category" });

    const countBy = (arr, keyFn) => {
      const m = {};
      arr.forEach((p) => {
        const keys = keyFn(p);
        keys.forEach((k) => { m[k] = (m[k] || 0) + 1; });
      });
      return m;
    };

    return {
      ai:       countBy(forAI,       (p) => p.ai_model ? [p.ai_model] : []),
      diff:     countBy(forDiff,     (p) => p.difficulty ? [p.difficulty] : []),
      sector:   countBy(forSector,   getSectorIds),
      category: countBy(forCategory, getCategoryIds),
    };
  }, [prompts, searchTerm, selectedAIs, selectedDifficulties, selectedSectors, selectedCategories]);

  const aiOptions = AI_OPTIONS.map((o) => ({ ...o, count: facets.ai[o.value] ?? 0 }));
  const diffOptions = DIFFICULTY_OPTIONS.map((o) => ({ ...o, count: facets.diff[o.value] ?? 0 }));

  const availableCategories =
    selectedSectors.length > 0
      ? categories.filter((c) => selectedSectors.includes(c.sectorId))
      : categories;

  const sectorOptions = sectors.map((s) => ({
    value: s.id,
    label: s.name,
    icon: s.icon,
    count: facets.sector[s.id] ?? 0,
  }));
  const categoryOptions = availableCategories.map((c) => ({
    value: c.id,
    label: c.name,
    count: facets.category[c.id] ?? 0,
  }));

  const hasActiveFilters =
    selectedAIs.length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedSectors.length > 0 ||
    selectedCategories.length > 0;

  const handleClearAll = () => {
    onAIsChange?.([]);
    onDifficultiesChange?.([]);
    onSectorsChange?.([]);
    onCategoriesChange?.([]);
    onClearAll?.();
  };

  return (
    <div className="space-y-2">
      {/* Row 1: search + sort */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar prompts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-10 pr-9 border border-border rounded-xl text-sm bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-[3px] focus:ring-ring/30 focus:border-ring transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <SortDropdown value={sortBy} onChange={onSortChange} />
      </div>

      {/* Row 2: filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <MultiSelectDropdown
          label="Modelo IA"
          options={aiOptions}
          selected={selectedAIs}
          onChange={onAIsChange}
        />
        <MultiSelectDropdown
          label="Nível"
          options={diffOptions}
          selected={selectedDifficulties}
          onChange={onDifficultiesChange}
        />
        {sectorOptions.length > 0 && (
          <MultiSelectDropdown
            label="Setor"
            options={sectorOptions}
            selected={selectedSectors}
            onChange={onSectorsChange}
          />
        )}
        {categoryOptions.length > 0 && (
          <MultiSelectDropdown
            label="Categoria"
            options={categoryOptions}
            selected={selectedCategories}
            onChange={onCategoriesChange}
          />
        )}

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleClearAll}
              className="cursor-pointer flex items-center gap-1 h-9 px-3 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors whitespace-nowrap"
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Sparkles,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ChevronDown,
  LayoutGrid,
  BookOpen,
  Layers,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { getPrompts, deletePrompt } from "../firebaseClient/prompts";
import { getCategories } from "../firebaseClient/categories";
import { getSectors } from "../firebaseClient/sectors";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SearchBar, { applySortFn } from "../components/prompts/SearchBar";
import PromptGrid from "../components/prompts/PromptGrid";
import PromptEditorModal from "../components/admin/PromptEditorModal";
import { toast } from "sonner";
import logoClaro from "../assets/logo_intranet_claro.png";
import logoEscuro from "../assets/logo_intranet_escuro.png";

const PAGE_SIZE = 20;

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
      <div className="skeleton h-px w-full mt-2" />
      <div className="skeleton h-3 w-20 rounded-md" />
    </div>
  );
}

export default function HomePage() {
  const { user, userProfile, isAdmin, isSuperAdmin } = useAuth();
  const { dark } = useTheme();
  const queryClient = useQueryClient();
  const promptsRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAIs, setSelectedAIs] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("alpha-asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [miranteOpen, setMiranteOpen] = useState(true);
  const [featuredOpen, setFeaturedOpen] = useState(true);

  const { data: prompts = [], isLoading: promptsLoading } = useQuery({
    queryKey: ["prompts"],
    queryFn: getPrompts,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors"],
    queryFn: getSectors,
  });

  const allowedSectorIds = userProfile?.sectorIds?.length
    ? userProfile.sectorIds
    : userProfile?.sectorId && userProfile.sectorId !== "__skipped__"
      ? [userProfile.sectorId]
      : [];

  const filteredPrompts = prompts.filter((p) => {
    const pSec = p.sectorIds?.length
      ? p.sectorIds
      : p.sectorId
        ? [p.sectorId]
        : [];
    const pCat = p.categoryIds?.length
      ? p.categoryIds
      : p.categoryId || p.category_id
        ? [p.categoryId || p.category_id]
        : [];
    return (
      (isAdmin ||
        !allowedSectorIds.length ||
        allowedSectorIds.some((id) => pSec.includes(id))) &&
      (selectedSectors.length === 0 ||
        selectedSectors.some((id) => pSec.includes(id))) &&
      (selectedCategories.length === 0 ||
        selectedCategories.some((id) => pCat.includes(id))) &&
      (!searchTerm ||
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.short_description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (selectedAIs.length === 0 || selectedAIs.includes(p.ai_model)) &&
      (selectedDifficulties.length === 0 ||
        selectedDifficulties.includes(p.difficulty))
    );
  });

  const sortedFiltered = [...filteredPrompts].sort(applySortFn(sortBy));
  const mirantePrompts = filteredPrompts.filter((p) => p.is_mirante_ia);
  const featuredPrompts = filteredPrompts.filter(
    (p) => p.is_featured && !p.is_mirante_ia,
  );

  const isFiltering =
    searchTerm ||
    selectedAIs.length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedSectors.length > 0 ||
    selectedCategories.length > 0;

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    selectedAIs,
    selectedDifficulties,
    selectedSectors,
    selectedCategories,
    sortBy,
  ]);
  useEffect(() => {
    if (selectedSectors.length > 0 && selectedCategories.length > 0) {
      const valid = selectedCategories.filter((cid) => {
        const cat = categories.find((c) => c.id === cid);
        return !cat || selectedSectors.includes(cat.sectorId);
      });
      if (valid.length !== selectedCategories.length)
        setSelectedCategories(valid);
    }
  }, [selectedSectors, categories]);

  const canEdit = (p) =>
    isAdmin || isSuperAdmin || p.createdBy === userProfile?.uid;
  const canDelete = (p) =>
    isAdmin || isSuperAdmin || p.createdBy === userProfile?.uid;

  const handleDeletePrompt = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePrompt(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt excluído.");
    } catch {
      toast.error("Erro ao excluir prompt.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const gridProps = {
    categories,
    sectors,
    onEdit: user ? setEditingPrompt : undefined,
    onDelete: user ? setDeleteTarget : undefined,
    canEdit: user ? canEdit : undefined,
    canDelete: user ? canDelete : undefined,
  };

  return (
    <div>
      {/* ════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {!isFiltering ? (
          <motion.section
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden border-b border-border"
          >
            {/* Radial background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: dark
                  ? "radial-gradient(ellipse 100% 140% at 30% -20%, rgba(99,102,241,0.12) 0%, transparent 60%)"
                  : "radial-gradient(ellipse 100% 140% at 30% -20%, rgba(79,70,229,0.08) 0%, transparent 60%)",
              }}
            />

            {/* Logo de fundo — mix-blend, lado direito */}
            <img
              src={dark ? logoEscuro : logoClaro}
              aria-hidden
              draggable={false}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-[110%] w-auto object-contain pointer-events-none select-none"
              style={{
                opacity: dark ? 0.1 : 0.12,
                mixBlendMode: dark ? "screen" : "multiply",
                filter: "blur(0.5px)",
              }}
            />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
              <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-20">
                {/* ── LEFT: logo + badge + texto ── */}
                <div className="flex-1 flex flex-col gap-5">
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-3"
                  >
                    <motion.img
                      src={dark ? logoEscuro : logoClaro}
                      alt="TV Mirante"
                      draggable={false}
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="h-16 sm:h-24 w-auto object-contain select-none"
                      style={{
                        filter: dark
                          ? "drop-shadow(0 0 20px rgba(99,102,241,0.50))"
                          : "drop-shadow(0 0 14px rgba(79,70,229,0.28))",
                      }}
                    />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-primary tracking-[0.12em] uppercase"
                    >
                      <span className="h-px w-5 bg-primary/50 shrink-0" />
                      Banco de Prompts de IA
                    </motion.span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.18,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="space-y-2"
                  >
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                      Prompts de IA prontos
                      <br />
                      <span className="gradient-text">para toda a equipe.</span>
                    </h1>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                      Acesse, copie e compartilhe prompts organizados por setor.
                      Eleve a produtividade da redação inteira.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.4 }}
                    className="flex flex-wrap gap-3"
                  >
                    <button
                      onClick={() =>
                        promptsRef.current?.scrollIntoView({
                          behavior: "smooth",
                        })
                      }
                      className="cursor-pointer inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity"
                    >
                      <Sparkles className="w-4 h-4" />
                      Explorar prompts
                    </button>
                    {user && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="cursor-pointer inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Novo prompt
                      </button>
                    )}
                  </motion.div>
                </div>

                {/* ── RIGHT: stats ── */}
                {!promptsLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.28,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="lg:shrink-0 flex flex-row lg:flex-col gap-6 lg:gap-0 lg:divide-y divide-border"
                  >
                    {[
                      {
                        icon: BookOpen,
                        value: prompts.length,
                        label: "Prompts",
                      },
                      { icon: Layers, value: sectors.length, label: "Setores" },
                      {
                        icon: FolderOpen,
                        value: categories.length,
                        label: "Categorias",
                      },
                    ].map(({ icon: Icon, value, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-4 lg:py-7 first:pt-0 last:pb-0"
                      >
                        <div className="w-0.5 h-10 rounded-full bg-primary/25 shrink-0 hidden lg:block" />
                        <div>
                          <div className="text-3xl font-bold text-foreground tabular-nums leading-none">
                            {value}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-background to-transparent pointer-events-none" />
          </motion.section>
        ) : (
          <motion.div
            key="filter-header"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2"
          >
            <h2 className="text-lg font-bold text-foreground">
              {searchTerm
                ? `Resultados para "${searchTerm}"`
                : "Prompts filtrados"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {sortedFiltered.length} prompt
              {sortedFiltered.length !== 1 ? "s" : ""} encontrado
              {sortedFiltered.length !== 1 ? "s" : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          PROMPTS
          ════════════════════════════════════════════════ */}
      <div
        ref={promptsRef}
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 pt-6 space-y-8"
      >
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
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
        </motion.div>

        {/* Skeleton */}
        {promptsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!promptsLoading && (
          <div className="space-y-8">
            {/* Mirante IA */}
            {mirantePrompts.length > 0 && (
              <CollapsibleSection
                variant="mirante"
                icon={
                  <div className="flex items-center gap-1.5">
                    <img
                      src={logoClaro}
                      alt=""
                      className="h-3.5 w-auto object-contain dark:hidden"
                    />
                    <img
                      src={logoEscuro}
                      alt=""
                      className="h-3.5 w-auto object-contain hidden dark:block"
                    />
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                }
                title="Mirante IA"
                count={mirantePrompts.length}
                open={miranteOpen}
                onToggle={() => setMiranteOpen((v) => !v)}
              >
                <PromptGrid prompts={mirantePrompts} {...gridProps} />
              </CollapsibleSection>
            )}

            {/* Em destaque */}
            {featuredPrompts.length > 0 && (
              <CollapsibleSection
                icon={<Star className="w-4 h-4 text-amber-500" />}
                title="Em destaque"
                count={featuredPrompts.length}
                open={featuredOpen}
                onToggle={() => setFeaturedOpen((v) => !v)}
              >
                <PromptGrid prompts={featuredPrompts} {...gridProps} />
              </CollapsibleSection>
            )}

            {/* Todos (paginado) */}
            <section className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2"
              >
                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                  {isFiltering ? "Resultados" : "Todos os prompts"}
                </h2>
                <span className="text-xs text-muted-foreground bg-surface px-2 py-0.5 rounded-full">
                  {sortedFiltered.length}
                </span>
              </motion.div>

              <PromptGrid
                prompts={sortedFiltered.slice(
                  (page - 1) * PAGE_SIZE,
                  page * PAGE_SIZE,
                )}
                {...gridProps}
                emptyMessage={
                  isFiltering
                    ? "Nenhum prompt encontrado com esses filtros."
                    : user
                      ? "Nenhum prompt ainda. Crie o primeiro!"
                      : "Nenhum prompt disponível ainda."
                }
              />
              <Pagination
                page={page}
                total={sortedFiltered.length}
                pageSize={PAGE_SIZE}
                onChange={setPage}
              />
            </section>
          </div>
        )}

        {/* FAB */}
        {user && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 220,
              damping: 18,
            }}
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer fixed bottom-24 lg:bottom-8 right-6 lg:right-8 flex items-center gap-2 h-12 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-glow z-20 overflow-hidden"
          >
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-primary/60"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Novo prompt</span>
          </motion.button>
        )}

        {showCreateModal && (
          <PromptEditorModal
            categories={categories}
            sectors={sectors}
            onSaved={() => {
              queryClient.invalidateQueries({ queryKey: ["prompts"] });
              setShowCreateModal(false);
            }}
            onClose={() => setShowCreateModal(false)}
          />
        )}
        {editingPrompt && (
          <PromptEditorModal
            prompt={editingPrompt}
            categories={categories}
            sectors={sectors}
            onSaved={() => {
              queryClient.invalidateQueries({ queryKey: ["prompts"] });
              setEditingPrompt(null);
            }}
            onClose={() => setEditingPrompt(null)}
          />
        )}
        <AnimatePresence>
          {deleteTarget && (
            <DeleteConfirmModal
              prompt={deleteTarget}
              deleting={deleting}
              onConfirm={handleDeletePrompt}
              onCancel={() => setDeleteTarget(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── StatCard ────────────────────────────────────────────────── */
function StatCard({ icon: Icon, value, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || !value) return;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 900, 1);
      setCount(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="flex lg:flex-row items-center gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-xs"
    >
      <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <div className="text-lg font-bold text-foreground tabular-nums leading-none">
          {count}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

/* ── CollapsibleSection ──────────────────────────────────────── */
function CollapsibleSection({
  icon,
  title,
  count,
  open,
  onToggle,
  children,
  variant,
}) {
  const isMirante = variant === "mirante";
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl overflow-hidden ${
        isMirante
          ? "border border-amber-300/50 dark:border-amber-700/30 bg-amber-50/40 dark:bg-amber-900/10"
          : "border border-border"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`cursor-pointer w-full flex items-center justify-between px-4 py-3 transition-colors ${
          isMirante
            ? "hover:bg-amber-100/60 dark:hover:bg-amber-900/20"
            : "hover:bg-surface/60"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="shrink-0 flex items-center">{icon}</span>
          <span
            className={`text-sm font-semibold ${isMirante ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}
          >
            {title}
          </span>
          <motion.span
            key={count}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className={`text-xs px-2 py-0.5 rounded-full ${
              isMirante
                ? "bg-amber-200/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                : "bg-surface text-muted-foreground"
            }`}
          >
            {count}
          </motion.span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown
            className={`w-4 h-4 ${isMirante ? "text-amber-500" : "text-muted-foreground"}`}
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className={`border-t px-4 py-5 ${isMirante ? "border-amber-200/60 dark:border-amber-800/30" : "border-border"}`}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/* ── Pagination ──────────────────────────────────────────────── */
function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center gap-1 pt-2"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <span key={p} className="flex items-center gap-1">
            {prev && p - prev > 1 && (
              <span className="text-xs text-muted-foreground px-1">…</span>
            )}
            <motion.button
              whileHover={p !== page ? { scale: 1.1 } : {}}
              whileTap={{ scale: 0.88 }}
              onClick={() => onChange(p)}
              className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
                p === page
                  ? "bg-primary text-primary-foreground font-medium shadow-glow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-surface"
              }`}
            >
              {p}
            </motion.button>
          </span>
        );
      })}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

/* ── DeleteConfirmModal ──────────────────────────────────────── */
function DeleteConfirmModal({ prompt, deleting, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-sm bg-background rounded-2xl border border-border shadow-premium z-10 p-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              Excluir prompt?
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              <span className="font-medium text-foreground">
                "{prompt.title}"
              </span>{" "}
              será removido permanentemente.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="cursor-pointer h-9 px-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="cursor-pointer flex items-center gap-2 h-9 px-5 bg-destructive text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, TrendingUp, Star, Plus, ChevronLeft, ChevronRight, Trash2, ChevronDown, LayoutGrid, BookOpen, Layers, FolderOpen } from "lucide-react";
import { getPrompts, deletePrompt } from "../firebaseClient/prompts";
import { getCategories } from "../firebaseClient/categories";
import { getSectors } from "../firebaseClient/sectors";
import { useAuth } from "../context/AuthContext";
import SearchBar, { applySortFn } from "../components/prompts/SearchBar";
import PromptGrid from "../components/prompts/PromptGrid";
import PromptEditorModal from "../components/admin/PromptEditorModal";
import { toast } from "sonner";

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
      <div className="flex justify-between">
        <div className="skeleton h-3 w-20 rounded-md" />
      </div>
    </div>
  );
}

const HERO_WORDS_1 = ["Prompts", "de", "IA", "para"];
const HERO_WORDS_2 = ["toda", "a", "equipe."];

export default function HomePage() {
  const { user, userProfile, isAdmin, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Hero parallax motion values
  const heroRef  = useRef(null);
  const heroMX   = useMotionValue(0);
  const heroMY   = useMotionValue(0);
  const orb1X = useSpring(useTransform(heroMX, [-1, 1], [-35, 35]),  { stiffness: 38, damping: 22 });
  const orb1Y = useSpring(useTransform(heroMY, [-1, 1], [-25, 25]),  { stiffness: 38, damping: 22 });
  const orb2X = useSpring(useTransform(heroMX, [-1, 1], [50, -50]),  { stiffness: 22, damping: 16 });
  const orb2Y = useSpring(useTransform(heroMY, [-1, 1], [40, -40]),  { stiffness: 22, damping: 16 });
  const orb3X = useSpring(useTransform(heroMX, [-1, 1], [-20, 20]),  { stiffness: 65, damping: 28 });
  const orb3Y = useSpring(useTransform(heroMY, [-1, 1], [14, -14]),  { stiffness: 65, damping: 28 });

  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroMX.set(((e.clientX - rect.left) / rect.width  - 0.5) * 2);
    heroMY.set(((e.clientY - rect.top)  / rect.height - 0.5) * 2);
  };

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

  // Collapsible section states
  const [featuredOpen, setFeaturedOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);

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
    const promptSectorIds = p.sectorIds?.length ? p.sectorIds : p.sectorId ? [p.sectorId] : [];
    const promptCategoryIds = p.categoryIds?.length
      ? p.categoryIds
      : p.categoryId || p.category_id
        ? [p.categoryId || p.category_id]
        : [];

    const inAllowedSector =
      isAdmin || !allowedSectorIds.length || allowedSectorIds.some((id) => promptSectorIds.includes(id));
    const matchesSector =
      selectedSectors.length === 0 || selectedSectors.some((id) => promptSectorIds.includes(id));
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.some((id) => promptCategoryIds.includes(id));
    const matchesSearch =
      !searchTerm ||
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAI = selectedAIs.length === 0 || selectedAIs.includes(p.ai_model);
    const matchesDifficulty =
      selectedDifficulties.length === 0 || selectedDifficulties.includes(p.difficulty);

    return inAllowedSector && matchesSector && matchesCategory && matchesSearch && matchesAI && matchesDifficulty;
  });

  const sortedFiltered = [...filteredPrompts].sort(applySortFn(sortBy));

  // Featured and recent always derive from the filtered set
  const featuredPrompts = filteredPrompts.filter((p) => p.is_featured);
  const recentPrompts = [...filteredPrompts]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 9);

  const isFiltering =
    searchTerm ||
    selectedAIs.length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedSectors.length > 0 ||
    selectedCategories.length > 0;

  // Reset page on filter / sort change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedAIs, selectedDifficulties, selectedSectors, selectedCategories, sortBy]);

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

  // Permission helpers
  const canEdit = (prompt) => {
    if (isAdmin || isSuperAdmin) return true;
    return prompt.createdBy === userProfile?.uid;
  };
  const canDelete = (prompt) => {
    if (isAdmin || isSuperAdmin) return true;
    return prompt.createdBy === userProfile?.uid;
  };

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
    <div className="space-y-0">
      {/* ── Hero Section ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!isFiltering ? (
          <motion.section
            key="hero"
            ref={heroRef}
            onMouseMove={handleHeroMouseMove}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden"
          >
            {/* Gradient background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 120% at 50% -30%, rgba(99,102,241,0.1) 0%, transparent 65%), " +
                  "radial-gradient(ellipse 40% 60% at 80% 50%, rgba(124,58,237,0.06) 0%, transparent 60%)",
              }}
            />

            {/* Dot grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.13) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage: "radial-gradient(ellipse 70% 80% at 30% 50%, black 0%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 30% 50%, black 0%, transparent 100%)",
              }}
            />

            {/* Floating orbs — parallax on mouse */}
            <motion.div
              style={{ x: orb1X, y: orb1Y, position: "absolute", top: "-30%", right: "5%", pointerEvents: "none" }}
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 320, height: 320,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 40% 40%, rgba(99,102,241,0.18) 0%, rgba(124,58,237,0.08) 50%, transparent 75%)",
                  filter: "blur(2px)",
                }}
              />
            </motion.div>

            <motion.div
              style={{ x: orb2X, y: orb2Y, position: "absolute", top: "25%", right: "-4%", pointerEvents: "none" }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                style={{
                  width: 200, height: 200,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 60% 60%, rgba(124,58,237,0.15) 0%, transparent 70%)",
                  filter: "blur(1px)",
                }}
              />
            </motion.div>

            <motion.div
              style={{ x: orb3X, y: orb3Y, position: "absolute", bottom: "8%", right: "22%", pointerEvents: "none" }}
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                style={{
                  width: 130, height: 130,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                }}
              />
            </motion.div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-10 sm:pt-14 sm:pb-12">
              <div className="max-w-2xl">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                  className="inline-flex items-center gap-2 mb-5 text-xs font-semibold text-primary bg-primary/8 border border-primary/20 px-3 py-1.5 rounded-full"
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  TV Mirante · Banco de Prompts de IA
                </motion.div>

                {/* Headline — word by word */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.12] mb-4 overflow-hidden">
                  <span className="inline-flex flex-wrap gap-x-[0.28em]">
                    {HERO_WORDS_1.map((word, i) => (
                      <motion.span
                        key={word + i}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-block"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                  <br />
                  <span className="gradient-text inline-flex flex-wrap gap-x-[0.28em]">
                    {HERO_WORDS_2.map((word, i) => (
                      <motion.span
                        key={word + i}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.44 + i * 0.08, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-block"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.4 }}
                  className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8"
                >
                  Encontre, copie e use prompts organizados por setor e
                  categoria. Eleve a produtividade de toda a redação.
                </motion.p>

                {/* Stats */}
                {!promptsLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.78, duration: 0.4 }}
                    className="flex flex-wrap gap-3"
                  >
                    <StatPill icon={BookOpen} value={prompts.length} label="prompts" />
                    <StatPill icon={Layers} value={sectors.length} label="setores" />
                    <StatPill icon={FolderOpen} value={categories.length} label="categorias" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
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
              {searchTerm ? `Resultados para "${searchTerm}"` : "Prompts filtrados"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {sortedFiltered.length} prompt{sortedFiltered.length !== 1 ? "s" : ""} encontrado
              {sortedFiltered.length !== 1 ? "s" : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rest of content ──────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 space-y-8">

      {/* Search + filters */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

      {/* Loading skeleton */}
      {promptsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Content */}
      {!promptsLoading && (
        <div className="space-y-8">

          {/* ── Em destaque (collapsible) ── */}
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

          {/* ── Adicionados recentemente (collapsible) ── */}
          <CollapsibleSection
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
            title="Adicionados recentemente"
            count={recentPrompts.length}
            open={recentOpen}
            onToggle={() => setRecentOpen((v) => !v)}
          >
            <PromptGrid
              prompts={recentPrompts}
              {...gridProps}
              emptyMessage={
                user
                  ? "Nenhum prompt ainda. Crie o primeiro usando o botão abaixo."
                  : "Nenhum prompt disponível ainda."
              }
            />
          </CollapsibleSection>

          {/* ── Todos os prompts (paginated) ── */}
          <section className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
              prompts={sortedFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
              {...gridProps}
              emptyMessage={
                isFiltering
                  ? "Nenhum prompt encontrado com esses filtros."
                  : user
                    ? "Nenhum prompt ainda. Crie o primeiro usando o botão abaixo."
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

      {/* FAB — create prompt (all logged-in users) */}
      {user && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 18 }}
          onClick={() => setShowCreateModal(true)}
          className="cursor-pointer fixed bottom-20 right-4 sm:bottom-8 sm:right-6 lg:bottom-8 lg:right-8 flex items-center gap-2 h-12 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-glow z-20 overflow-hidden"
          title="Criar novo prompt"
        >
          {/* Ripple ring */}
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-primary/60"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <Plus className="w-4 h-4 relative z-10" />
          <span className="hidden sm:inline relative z-10">Novo prompt</span>
        </motion.button>
      )}

      {/* Create prompt modal */}
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

      {/* Edit prompt modal */}
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

      {/* Delete confirmation modal */}
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

/* ── CollapsibleSection ──────────────────────────────────────── */
function CollapsibleSection({ icon, title, count, open, onToggle, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ backgroundColor: "rgba(var(--surface-rgb, 241,241,247), 0.7)" }}
        className="cursor-pointer w-full flex items-center justify-between px-4 py-3 hover:bg-surface/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={open ? { rotate: 0, scale: 1.1 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <motion.span
            key={count}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-xs text-muted-foreground bg-surface px-2 py-0.5 rounded-full"
          >
            {count}
          </motion.span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

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
            <div className="border-t border-border px-4 py-5">
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
            <h3 className="font-semibold text-foreground text-sm">Excluir prompt?</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              O prompt <span className="font-medium text-foreground">"{prompt.title}"</span> será
              excluído permanentemente. Esta ação não pode ser desfeita.
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
            className="cursor-pointer flex items-center gap-2 h-9 px-5 bg-destructive text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
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

/* ── StatPill ────────────────────────────────────────────────── */
function StatPill({ icon: Icon, value, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || !value) return;
    const duration = 900;
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(value * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -2, scale: 1.03 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-xs cursor-default"
    >
      <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
      <span className="text-sm font-bold text-foreground tabular-nums">{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </motion.div>
  );
}

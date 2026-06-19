import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart,
  Copy,
  CheckCheck,
  Star,
  Eye,
  Pencil,
  Trash2,
  Sparkles,
  ThumbsUp,
  Download,
} from "lucide-react";
import AiBadge from "./AiBadge";
import DifficultyBadge from "./DifficultyBadge";
import { useFavorites } from "../../hooks/useFavorites";
import { useLikes } from "../../hooks/useLikes";
import { useHistory } from "../../hooks/useHistory";
import { incrementPromptCopy } from "../../firebaseClient/prompts";
import { toast } from "sonner";
import { useTheme } from "../../context/ThemeContext";
import logoClaro from "../../assets/logo_intranet_claro.png";
import logoEscuro from "../../assets/logo_intranet_escuro.png";

export default function PromptCard({
  prompt,
  categories = [],
  sectors = [],
  index = 0,
  onEdit,
  onDelete,
}) {
  const { isFavorite, toggle: toggleFav } = useFavorites();
  const { isLiked, toggle: toggleLike } = useLikes();
  const { record: recordHistory } = useHistory();
  const { dark } = useTheme();

  const favorited = isFavorite(prompt.id);
  const liked = isLiked(prompt.id);

  const [copied, setCopied] = useState(false);

  const wrapperRef = useRef(null);
  const glowRef = useRef(null);
  const shineRef = useRef(null);

  // Resolve sector(s) / category(ies) with backward-compat
  const sectorIds = prompt.sectorIds?.length
    ? prompt.sectorIds
    : prompt.sectorId
      ? [prompt.sectorId]
      : [];
  const categoryIds = prompt.categoryIds?.length
    ? prompt.categoryIds
    : prompt.categoryId || prompt.category_id
      ? [prompt.categoryId || prompt.category_id]
      : [];

  const resolvedSectors = sectorIds
    .map((id) => sectors.find((s) => s.id === id))
    .filter(Boolean);
  const resolvedCategories = categoryIds
    .map((id) => categories.find((c) => c.id === id))
    .filter(Boolean);

  const primarySector = resolvedSectors[0];
  const primaryCategory = resolvedCategories[0];
  const accentColor =
    primaryCategory?.color || primarySector?.color || "#6366f1";

  /* ── Mouse tracking ── */
  const handleMouseMove = (e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (glowRef.current)
      glowRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, ${accentColor}28 0%, transparent 62%)`;
    if (shineRef.current)
      shineRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.08) 0%, transparent 50%)`;
    const tiltX = (y - 0.5) * -10;
    const tiltY = (x - 0.5) * 10;
    wrapperRef.current.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
  };

  const handleMouseLeave = () => {
    if (glowRef.current) glowRef.current.style.background = "";
    if (shineRef.current) shineRef.current.style.background = "";
    if (wrapperRef.current) wrapperRef.current.style.transform = "";
  };

  /* ── Action handlers ── */
  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!prompt.content) {
      toast.error("Conteúdo não disponível.");
      return;
    }
    await navigator.clipboard.writeText(prompt.content);
    await incrementPromptCopy(prompt.id).catch(() => null);
    recordHistory(prompt.id);
    setCopied(true);
    toast.success("Prompt copiado!");
    setTimeout(() => setCopied(false), 1800);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFav(prompt.id);
  };
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(prompt.id);
  };
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(prompt);
  };
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(prompt);
  };

  const handleExport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!prompt.content) {
      toast.error("Conteúdo não disponível.");
      return;
    }
    const sectorNames = resolvedSectors.map((s) => s.name).join(", ") || "—";
    const categoryNames =
      resolvedCategories.map((c) => c.name).join(", ") || "—";
    const lines = [
      `BANCO DE PROMPTS — TV MIRANTE`,
      `${"=".repeat(50)}`,
      ``,
      `Título:     ${prompt.title || "—"}`,
      `Setor:      ${sectorNames}`,
      `Categoria:  ${categoryNames}`,
      `IA:         ${prompt.ai_model || "—"}`,
      `Dificuldade:${prompt.difficulty || "—"}`,
      ``,
      `${"─".repeat(50)}`,
      ``,
      prompt.content,
      ``,
      `${"─".repeat(50)}`,
      `Exportado em: ${new Date().toLocaleString("pt-BR")}`,
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `prompt-${(prompt.title || "sem-titulo").toLowerCase().replace(/\s+/g, "-").slice(0, 40)}.txt`,
    });
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Prompt exportado!");
  };

  const likesCount = prompt.likesCount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: Math.min(index * 0.055, 0.3),
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={wrapperRef}
        className="h-full"
        style={{
          transformOrigin: "center center",
          transition: "transform 0.07s ease-out",
          willChange: "transform",
        }}
      >
        <Link to={`/prompt/${prompt.id}`} className="block h-full">
          <div className="relative bg-card border border-border rounded-2xl p-5 h-full flex flex-col shadow-card hover:shadow-card-hover hover:border-primary/20 overflow-hidden transition-[box-shadow,border-color] duration-300">
            {/* Mouse-tracking glow */}
            <div
              ref={glowRef}
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div
              ref={shineRef}
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden rounded-t-2xl">
              <div
                className="absolute inset-0"
                style={{ backgroundColor: accentColor, opacity: 0.55 }}
              />
              <div
                className="absolute inset-0 card-accent-shimmer"
                style={{ "--shimmer-color": "rgba(255,255,255,0.55)" }}
              />
            </div>

            {/* Featured star */}
            {prompt.is_featured && !prompt.is_mirante_ia && (
              <motion.div
                className="absolute top-3.5 right-3.5"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </motion.div>
            )}

            {/* Selo Mirante IA */}
            {prompt.is_mirante_ia && (
              <motion.div
                className="absolute top-3 right-3"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/25 border border-amber-300/60 dark:border-amber-600/40 shadow-sm">
                  <img
                    src={dark ? logoEscuro : logoClaro}
                    alt=""
                    className="h-2.5 w-auto object-contain"
                  />
                  <Sparkles className="w-2 h-2 text-amber-500" />
                  <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 tracking-widest uppercase leading-none">
                    Mirante IA
                  </span>
                </div>
              </motion.div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 mt-1 pr-5">
              {prompt.ai_model && <AiBadge ai={prompt.ai_model} />}
              {prompt.difficulty && (
                <DifficultyBadge level={prompt.difficulty} />
              )}
            </div>

            {/* Sector chips */}
            {resolvedSectors.length > 0 && (
              <div className="flex items-center gap-1 mb-2.5 flex-wrap">
                {resolvedSectors.slice(0, 2).map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface border border-border text-muted-foreground"
                  >
                    {s.icon && <span className="leading-none">{s.icon}</span>}
                    {s.name}
                  </span>
                ))}
                {resolvedSectors.length > 2 && (
                  <span className="text-[10px] text-muted-foreground/60">
                    +{resolvedSectors.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
              {prompt.title}
            </h3>

            {/* Description */}
            {prompt.short_description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                {prompt.short_description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 gap-2">
              {/* Category dot + name */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {primaryCategory ? (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span className="truncate">{primaryCategory.name}</span>
                    {resolvedCategories.length > 1 && (
                      <span className="text-muted-foreground/50 shrink-0">
                        +{resolvedCategories.length - 1}
                      </span>
                    )}
                  </span>
                ) : (
                  <span />
                )}
              </div>

              {/* Stats + action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Counters */}
                {(prompt.viewCount > 0 ||
                  prompt.copyCount > 0 ||
                  likesCount > 0) && (
                  <span className="flex items-center gap-2 text-[10px] text-muted-foreground/60 mr-1">
                    {prompt.viewCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" />
                        {prompt.viewCount >= 1000
                          ? `${(prompt.viewCount / 1000).toFixed(1)}k`
                          : prompt.viewCount}
                      </span>
                    )}
                    {prompt.copyCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Copy className="w-2.5 h-2.5" />
                        {prompt.copyCount >= 1000
                          ? `${(prompt.copyCount / 1000).toFixed(1)}k`
                          : prompt.copyCount}
                      </span>
                    )}
                    {likesCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <ThumbsUp className="w-2.5 h-2.5" />
                        {likesCount}
                      </span>
                    )}
                  </span>
                )}

                {/* Edit */}
                {onEdit && (
                  <motion.button
                    onClick={handleEdit}
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ scale: 1.15 }}
                    className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors opacity-0 group-hover:opacity-100"
                    title="Editar"
                  >
                    <Pencil className="w-3 h-3" />
                  </motion.button>
                )}

                {/* Delete */}
                {onDelete && (
                  <motion.button
                    onClick={handleDelete}
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ scale: 1.15 }}
                    className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir"
                  >
                    <Trash2 className="w-3 h-3" />
                  </motion.button>
                )}

                {/* Export */}
                <motion.button
                  onClick={handleExport}
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.15 }}
                  className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors opacity-0 group-hover:opacity-100"
                  title="Exportar .txt"
                >
                  <Download className="w-3 h-3" />
                </motion.button>

                {/* Copy — always visible, icon muda para check */}
                <motion.button
                  onClick={handleCopy}
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.15 }}
                  className={`cursor-pointer w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
                    copied
                      ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface opacity-0 group-hover:opacity-100"
                  }`}
                  title="Copiar prompt"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "check" : "copy"}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-center"
                    >
                      {copied ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                {/* Like */}
                <motion.button
                  onClick={handleLike}
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.15 }}
                  className={`cursor-pointer w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
                    liked
                      ? "text-primary bg-primary/10 opacity-100"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/8 opacity-0 group-hover:opacity-100"
                  }`}
                  title={liked ? "Remover curtida" : "Curtir"}
                >
                  <ThumbsUp
                    className="w-3 h-3"
                    fill={liked ? "currentColor" : "none"}
                  />
                </motion.button>

                {/* Favorite */}
                <motion.button
                  onClick={handleFavorite}
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.15 }}
                  className={`cursor-pointer w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
                    favorited
                      ? "text-rose-500 bg-rose-50 dark:bg-rose-900/20 opacity-100"
                      : "text-muted-foreground hover:text-rose-500 hover:bg-surface opacity-0 group-hover:opacity-100"
                  }`}
                  title={favorited ? "Remover favorito" : "Favoritar"}
                >
                  <Heart
                    className="w-3 h-3"
                    fill={favorited ? "currentColor" : "none"}
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

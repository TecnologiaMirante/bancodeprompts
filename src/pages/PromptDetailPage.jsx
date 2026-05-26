import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Heart,
  Check,
  Calendar,
  User,
  Eye,
  Hash,
  Lightbulb,
  ChevronRight,
  Share2,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sparkles } from "lucide-react";
import logoClaro from "../assets/logo_claro.png";
import logoEscuro from "../assets/logo_escuro.png";
import {
  getPromptById,
  deletePrompt,
  incrementPromptView,
} from "../firebaseClient/prompts";
import { getCategories } from "../firebaseClient/categories";
import { getSectors } from "../firebaseClient/sectors";
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../context/AuthContext";
import AiBadge from "../components/prompts/AiBadge";
import DifficultyBadge from "../components/prompts/DifficultyBadge";
import PromptEditorModal from "../components/admin/PromptEditorModal";
import { ConfirmModal } from "../components/ui/confirm-modal";
import { toast } from "sonner";

export default function PromptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isFavorite, toggle } = useFavorites();
  const { isAdmin, isSuperAdmin, userProfile } = useAuth();
  const { dark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: prompt, isLoading } = useQuery({
    queryKey: ["prompt", id],
    queryFn: () => getPromptById(id),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors"],
    queryFn: getSectors,
  });

  useEffect(() => {
    if (id) incrementPromptView(id).catch(() => null);
  }, [id]);

  const category = categories.find(
    (c) => c.id === prompt?.categoryId || c.id === prompt?.category_id,
  );
  const favorited  = isFavorite(id);
  const isOwner    = !!userProfile?.uid && prompt?.createdBy === userProfile.uid;
  const canEdit    = isAdmin || isSuperAdmin || isOwner;
  const canDelete  = isAdmin || isSuperAdmin || isOwner;

  const handleCopy = async () => {
    if (!prompt?.content) {
      toast.error("Conteúdo não disponível.");
      return;
    }
    await navigator.clipboard.writeText(prompt.content);
    await import("../firebaseClient/prompts")
      .then((m) => m.incrementPromptCopy(id))
      .catch(() => null);
    setCopied(true);
    toast.success("Prompt copiado!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: prompt?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePrompt(id);
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt excluído.");
      navigate("/");
    } catch {
      toast.error("Erro ao excluir prompt.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return null;
    const date = ts.toDate?.() || new Date(ts);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div className="skeleton h-4 w-24 rounded-md" />
        <div className="skeleton h-8 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-md" />
        <div className="skeleton h-52 w-full rounded-2xl" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center space-y-3">
        <p className="text-muted-foreground font-medium">
          Prompt não encontrado.
        </p>
        <Link to="/" className="text-primary text-sm hover:underline">
          ← Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 lg:pb-8"
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">
            Início
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
              <span>{category.name}</span>
            </>
          )}
          <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-50">
            {prompt.title}
          </span>
        </nav>

        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            {prompt.ai_model && <AiBadge ai={prompt.ai_model} size="md" />}
            {prompt.difficulty && <DifficultyBadge level={prompt.difficulty} />}
            {category && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-surface border border-border px-2.5 py-1 rounded-lg">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            )}
            {prompt.is_mirante_ia && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-300/70 dark:border-amber-600/40 shadow-sm"
              >
                <img src={dark ? logoEscuro : logoClaro} alt="TV Mirante" className="h-3.5 w-auto object-contain" />
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-widest uppercase">
                  Mirante IA
                </span>
              </motion.div>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {prompt.title}
          </h1>

          {prompt.short_description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {prompt.short_description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border">
            {prompt.createdByName && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 shrink-0" />
                {prompt.createdByName}
              </span>
            )}
            {prompt.createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {formatDate(prompt.createdAt)}
              </span>
            )}
            {prompt.viewCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 shrink-0" />
                {prompt.viewCount.toLocaleString("pt-BR")} views
              </span>
            )}
            {prompt.copyCount > 0 && (
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                {prompt.copyCount.toLocaleString("pt-BR")} cópias
              </span>
            )}
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-5 mb-8">
          <Section
            icon={Hash}
            iconColor="text-muted-foreground fill-muted-foreground"
            title="Prompt"
          >
            <div className="relative group/content">
              <pre className="bg-surface border border-border rounded-xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap font-mono overflow-x-auto">
                {prompt.content || (
                  <span className="text-muted-foreground italic">
                    Conteúdo não disponível.
                  </span>
                )}
              </pre>
              <div className="absolute top-3 right-3">
                <button
                  onClick={handleCopy}
                  className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    copied
                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                      : "bg-background border border-border text-muted-foreground hover:text-foreground opacity-0 group-hover/content:opacity-100"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          </Section>

          {prompt.instructions && (
            <Section
              icon={Lightbulb}
              iconColor="text-amber-400 fill-amber-400"
              title="Como usar"
            >
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {prompt.instructions}
              </p>
            </Section>
          )}

          {prompt.observations && (
            <Section
              icon={Lightbulb}
              iconColor="text-violet-400 fill-violet-400"
              title="Observações"
            >
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {prompt.observations}
              </p>
            </Section>
          )}
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-border">
          {/* Primary: copy */}
          <button
            onClick={handleCopy}
            className="cursor-pointer flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copiado!" : "Copiar prompt"}
          </button>

          {/* Favorite */}
          <button
            onClick={() => toggle(id)}
            className={`cursor-pointer flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border transition-all ${
              favorited
                ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={favorited ? "currentColor" : "none"}
            />
            <span className="hidden sm:inline">
              {favorited ? "Favoritado" : "Favoritar"}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="cursor-pointer flex items-center gap-2 h-10 px-4 rounded-xl text-sm border border-border bg-surface text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>

          {/* Edit / delete — admin or own creator */}
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1.5 ml-auto">
              {canEdit && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="cursor-pointer flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-medium border border-border bg-surface text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="cursor-pointer flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-medium border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              )}
            </div>
          )}

          {!(canEdit || canDelete) && (
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Edit modal */}
      {showEditModal && (
        <PromptEditorModal
          prompt={prompt}
          categories={categories}
          sectors={sectors}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["prompt", id] });
            queryClient.invalidateQueries({ queryKey: ["prompts"] });
            setShowEditModal(false);
            toast.success("Prompt atualizado!");
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Excluir prompt"
        description="Esta ação não pode ser desfeita. O prompt será removido permanentemente da plataforma."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

function Section({ icon: Icon, iconColor, title, children }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

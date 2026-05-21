import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, Search } from "lucide-react";
import {
  createSector,
  updateSector,
  deleteSector,
} from "../../firebaseClient/sectors";
import { Button } from "../ui/button";
import { ConfirmModal } from "../ui/confirm-modal";
import { toast } from "sonner";

const EMPTY = { name: "", icon: "📰", color: "#6366f1" };

const EMOJI_LIST = [
  { emoji: "📰", label: "jornal notícia jornalismo" },
  { emoji: "🗞️", label: "jornal impresso reportagem" },
  { emoji: "📝", label: "bloco notas pauta redação" },
  { emoji: "✍️", label: "escrevendo reportagem texto" },
  { emoji: "🖊️", label: "caneta jornalista escrever" },
  { emoji: "🎤", label: "microfone reportagem entrevista" },
  { emoji: "🔍", label: "investigação apuração pesquisa" },
  { emoji: "📋", label: "pauta prancheta lista" },
  { emoji: "📌", label: "destaque fixar pauta" },
  { emoji: "🗂️", label: "arquivo documentação pasta" },
  { emoji: "📻", label: "rádio transmissão AM FM" },
  { emoji: "🎙️", label: "microfone estúdio locução" },
  { emoji: "🎧", label: "fones ouvido monitoramento áudio" },
  { emoji: "🔊", label: "alto-falante som transmissão" },
  { emoji: "📡", label: "antena satélite transmissão sinal" },
  { emoji: "🎵", label: "música trilha sonora rádio" },
  { emoji: "🎶", label: "notas musicais programa musical" },
  { emoji: "⏺️", label: "gravação ao vivo record" },
  { emoji: "🔉", label: "volume áudio som" },
  { emoji: "🎬", label: "produção claquete gravação" },
  { emoji: "🎥", label: "câmera filmagem vídeo" },
  { emoji: "📺", label: "televisão TV telejornal" },
  { emoji: "🎞️", label: "edição filme corte" },
  { emoji: "📷", label: "fotografia foto imagem" },
  { emoji: "🎭", label: "programa entretenimento" },
  { emoji: "🎪", label: "evento especial cobertura" },
  { emoji: "🎦", label: "cinema audiovisual" },
  { emoji: "📹", label: "vídeo gravação externo" },
  { emoji: "🖥️", label: "monitor masterização exibição" },
  { emoji: "✂️", label: "edição corte montagem" },
  { emoji: "🖱️", label: "edição software computador" },
  { emoji: "💻", label: "laptop edição produção" },
  { emoji: "🎨", label: "arte design criação" },
  { emoji: "🖌️", label: "design gráfico arte" },
  { emoji: "🖼️", label: "imagem thumbnail arte" },
  { emoji: "⚡", label: "rapidez urgência breaking news" },
  { emoji: "📱", label: "celular redes sociais digital" },
  { emoji: "📲", label: "smartphone publicação post" },
  { emoji: "💬", label: "comentários interação chat" },
  { emoji: "📣", label: "divulgação anúncio publicação" },
  { emoji: "📢", label: "comunicação alcance engajamento" },
  { emoji: "🌐", label: "internet web portal digital" },
  { emoji: "📸", label: "stories foto redes sociais" },
  { emoji: "🔗", label: "link compartilhamento digital" },
  { emoji: "👍", label: "curtida like engajamento" },
  { emoji: "♾️", label: "instagram meta digital" },
  { emoji: "📊", label: "marketing métricas análise" },
  { emoji: "📈", label: "crescimento resultado campanha" },
  { emoji: "🎯", label: "objetivo meta campanha" },
  { emoji: "💡", label: "ideia criatividade inovação" },
  { emoji: "🏷️", label: "marca branding identidade" },
  { emoji: "✨", label: "destaque qualidade premium" },
  { emoji: "🌟", label: "estrela destaque conteúdo" },
  { emoji: "🚀", label: "lançamento viral crescimento" },
  { emoji: "🔥", label: "trending viral quente" },
  { emoji: "🎁", label: "promoção brinde patrocínio" },
  { emoji: "💼", label: "comercial negócios vendas" },
  { emoji: "🤝", label: "parceria cliente negociação" },
  { emoji: "📑", label: "proposta contrato documento" },
  { emoji: "💰", label: "receita faturamento financeiro" },
  { emoji: "💵", label: "dinheiro verba orçamento" },
  { emoji: "📉", label: "relatório análise comercial" },
  { emoji: "🏆", label: "meta resultado premiação" },
  { emoji: "🎖️", label: "reconhecimento desempenho" },
  { emoji: "⚙️", label: "tecnologia configuração sistema" },
  { emoji: "🔧", label: "suporte manutenção TI" },
  { emoji: "🤖", label: "automação IA inteligência artificial" },
  { emoji: "🔒", label: "segurança privacidade dados" },
  { emoji: "🛡️", label: "proteção segurança cibernética" },
  { emoji: "💾", label: "dados backup armazenamento" },
  { emoji: "🖨️", label: "impressão infraestrutura" },
  { emoji: "⌨️", label: "desenvolvimento programação" },
  { emoji: "📶", label: "rede sinal conectividade" },
  { emoji: "🔌", label: "infraestrutura elétrica sistemas" },
  { emoji: "🏦", label: "financeiro banco contabilidade" },
  { emoji: "💳", label: "pagamento cartão finanças" },
  { emoji: "🧾", label: "nota fiscal despesa contábil" },
  { emoji: "📆", label: "agenda planejamento orçamento" },
  { emoji: "🗓️", label: "calendário cronograma prazo" },
  { emoji: "💹", label: "investimento resultado financeiro" },
  { emoji: "📒", label: "contabilidade registros livro" },
  { emoji: "👥", label: "equipe pessoas recursos humanos" },
  { emoji: "👤", label: "colaborador funcionário usuário" },
  { emoji: "🧑‍💼", label: "profissional gestor RH" },
  { emoji: "🎓", label: "treinamento capacitação formação" },
  { emoji: "🤗", label: "cultura clima organizacional" },
  { emoji: "🧭", label: "direção estratégia liderança" },
  { emoji: "📍", label: "sede localização endereço" },
  { emoji: "🏢", label: "empresa organização sede" },
  { emoji: "🗣️", label: "reunião apresentação gestão" },
  { emoji: "📎", label: "documentos organização geral" },
  { emoji: "📁", label: "pasta arquivo geral" },
  { emoji: "📂", label: "pasta aberta documentos" },
];

/* ── Info button SVG ─────────────────────────────────────────── */
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

/* ── Sector details popover ──────────────────────────────────── */
function SectorPopover({ sector, categories, prompts, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const sectorCategories = categories.filter((c) => c.sectorId === sector.id);

  const sectorPrompts = prompts.filter((p) => {
    const ids = p.sectorIds?.length ? p.sectorIds : p.sectorId ? [p.sectorId] : [];
    return ids.includes(sector.id);
  });

  const promptsByCat = sectorCategories.map((c) => ({
    ...c,
    count: sectorPrompts.filter((p) => {
      const cIds = p.categoryIds?.length ? p.categoryIds : p.categoryId || p.category_id ? [p.categoryId || p.category_id] : [];
      return cIds.includes(c.id);
    }).length,
  }));

  const uncategorized = sectorPrompts.filter((p) => {
    const cIds = p.categoryIds?.length ? p.categoryIds : p.categoryId || p.category_id ? [p.categoryId || p.category_id] : [];
    return !sectorCategories.some((c) => cIds.includes(c.id));
  }).length;

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className="absolute left-0 top-full mt-2 z-50 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/60">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">
          {sector.icon} {sector.name}
        </p>
        <button
          onClick={onClose}
          className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-border">
        {/* Categorias */}
        <div className="py-2">
          <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Categorias ({sectorCategories.length})
          </p>
          {sectorCategories.length === 0 ? (
            <p className="px-4 text-[11px] text-muted-foreground italic pb-1">Nenhuma categoria</p>
          ) : (
            promptsByCat.map((c) => (
              <div key={c.id} className="px-4 py-1.5 flex items-center gap-2 hover:bg-surface/60">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color || "#6366f1" }} />
                <p className="text-xs text-foreground flex-1 truncate">{c.name}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">{c.count} prompt{c.count !== 1 ? "s" : ""}</span>
              </div>
            ))
          )}
        </div>

        {/* Prompts total */}
        <div className="py-2">
          <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Prompts ({sectorPrompts.length})
          </p>
          <div className="px-4 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {sectorPrompts.length === 0
                ? "Nenhum prompt neste setor."
                : `${sectorPrompts.length} prompt${sectorPrompts.length !== 1 ? "s" : ""} no total`}
            </span>
          </div>
          {uncategorized > 0 && (
            <p className="px-4 mt-1 text-[10px] text-muted-foreground/60 italic">
              {uncategorized} sem categoria definida
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Emoji picker ────────────────────────────────────────────── */
function EmojiPicker({ value, onChange }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return EMOJI_LIST;
    const q = search.toLowerCase();
    return EMOJI_LIST.filter((e) => e.label.includes(q) || e.emoji === q);
  }, [search]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl border border-border bg-surface flex items-center justify-center text-xl shrink-0">
          {value || "📰"}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar: rádio, edição, marketing…"
            className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
      </div>
      <div className="border border-border rounded-xl bg-surface overflow-y-auto max-h-44 p-2">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">Nenhum emoji encontrado</p>
        ) : (
          <div className="grid grid-cols-10 gap-0.5">
            {filtered.map(({ emoji }) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onChange(emoji)}
                title={emoji}
                className={`cursor-pointer w-8 h-8 flex items-center justify-center text-lg rounded-lg transition-all hover:bg-background ${
                  value === emoji ? "bg-primary/10 ring-1 ring-primary/40 scale-110" : "hover:scale-110"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {filtered.length} emoji{filtered.length !== 1 ? "s" : ""}
        {search ? ` para "${search}"` : " disponíveis"}
      </p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function SectorsTab({ sectors, setSectors, categories = [], prompts = [] }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeInfoId, setActiveInfoId] = useState(null);

  const startCreate = () => {
    setForm(EMPTY);
    setCreating(true);
    setEditing(null);
    setActiveInfoId(null);
  };

  const startEdit = (sector) => {
    setForm({ name: sector.name, icon: sector.icon || "📰", color: sector.color || "#6366f1" });
    setEditing(sector);
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
        const ref = await createSector(form);
        setSectors((prev) => [...prev, { id: ref.id, ...form }]);
        toast.success("Setor criado.");
      } else {
        await updateSector(editing.id, form);
        setSectors((prev) =>
          prev.map((s) => (s.id === editing.id ? { ...s, ...form } : s)),
        );
        toast.success("Setor atualizado.");
      }
      cancel();
    } catch {
      toast.error("Erro ao salvar setor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSector(deleteTarget);
      setSectors((prev) => prev.filter((s) => s.id !== deleteTarget));
      toast.success("Setor excluído.");
    } catch {
      toast.error("Erro ao excluir setor.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getCatCount = (sectorId) => categories.filter((c) => c.sectorId === sectorId).length;
  const getPromptCount = (sectorId) =>
    prompts.filter((p) => {
      const ids = p.sectorIds?.length ? p.sectorIds : p.sectorId ? [p.sectorId] : [];
      return ids.includes(sectorId);
    }).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Setores</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sectors.length} setor{sectors.length !== 1 ? "es" : ""} cadastrado{sectors.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={startCreate} size="sm">
          <Plus className="w-4 h-4" />
          Novo setor
        </Button>
      </div>

      {/* Form */}
      {(creating || editing) && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {creating ? "Novo setor" : `Editar: ${editing?.name}`}
          </h3>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nome *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Jornalismo, Rádio, Edição…"
              className="w-full h-9 px-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Ícone</label>
            <EmojiPicker
              value={form.icon}
              onChange={(emoji) => setForm((f) => ({ ...f, icon: emoji }))}
            />
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
        {sectors.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhum setor cadastrado ainda.
          </div>
        ) : (
          sectors.map((sector) => {
            const catCount = getCatCount(sector.id);
            const promptCount = getPromptCount(sector.id);
            const isInfoOpen = activeInfoId === sector.id;

            return (
              <div
                key={sector.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface/50 transition-colors"
              >
                <span className="text-xl leading-none w-7 text-center shrink-0">
                  {sector.icon || "📰"}
                </span>

                {/* Name + info button + popover */}
                <div className="flex-1 min-w-0 relative">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {sector.name}
                    </span>
                    <button
                      onClick={() => setActiveInfoId(isInfoOpen ? null : sector.id)}
                      className={`cursor-pointer shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isInfoOpen
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                      title="Ver categorias e prompts deste setor"
                    >
                      <InfoIcon />
                    </button>
                  </div>

                  {/* Stat chips under name */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-medium text-muted-foreground bg-surface border border-border px-1.5 py-0.5 rounded-md">
                      {catCount} categoria{catCount !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground bg-surface border border-border px-1.5 py-0.5 rounded-md">
                      {promptCount} prompt{promptCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Popover */}
                  {isInfoOpen && (
                    <SectorPopover
                      sector={sector}
                      categories={categories}
                      prompts={prompts}
                      onClose={() => setActiveInfoId(null)}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(sector)}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(sector.id)}
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir setor"
        description="Esta ação não pode ser desfeita. O setor será removido permanentemente."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

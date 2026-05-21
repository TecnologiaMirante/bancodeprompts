import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Save, Check, ChevronDown, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { createPrompt, updatePrompt } from "../../firebaseClient/prompts";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { NativeSelect } from "../ui/native-select";

const AI_MODELS = ["ChatGPT", "Claude", "Gemini", "Perplexity", "DeepSeek", "Copilot"];
const DIFFICULTIES = ["Iniciante", "Intermediário", "Avançado"];

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (val) return [val];
  return [];
}

const EMPTY_FORM = {
  title: "",
  short_description: "",
  content: "",
  ai_model: "ChatGPT",
  difficulty: "Iniciante",
  sectorIds: [],
  categoryIds: [],
  instructions: "",
  observations: "",
  is_featured: false,
};

/* ── CheckboxGroup — colapsável ──────────────────────────────── */
function CheckboxGroup({ label, options, selected, onChange, emptyText }) {
  const [open, setOpen] = useState(true);

  const allSelected = options.length > 0 && options.every((o) => selected.includes(o.id));
  const toggleAll = () => onChange(allSelected ? [] : options.map((o) => o.id));
  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const selectedNames = options
    .filter((o) => selected.includes(o.id))
    .map((o) => o.name)
    .join(", ");

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer w-full flex items-center justify-between px-3 py-2 hover:bg-surface/60 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[0.8125rem] font-medium text-foreground">{label}</span>
          {selected.length > 0 && (
            <span className="text-[11px] text-muted-foreground truncate max-w-52">{selectedNames}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selected.length > 0 && (
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
              {selected.length}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-3 py-2.5 space-y-2">
          {options.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">{emptyText}</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {options.map((opt) => {
                  const isChecked = selected.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggle(opt.id)}
                      className={`cursor-pointer flex items-center gap-1 h-6 px-2 rounded-lg border text-[11px] font-medium transition-all ${
                        isChecked
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-3 h-3 rounded border transition-all shrink-0 ${
                          isChecked ? "bg-primary border-primary" : "border-border/60"
                        }`}
                      >
                        {isChecked && <Check className="w-2 h-2 text-white" />}
                      </span>
                      {opt.icon && <span className="text-xs">{opt.icon}</span>}
                      {opt.name}
                    </button>
                  );
                })}
              </div>
              {options.length > 1 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="cursor-pointer text-[11px] text-primary hover:underline font-medium"
                >
                  {allSelected ? "Desmarcar todos" : "Marcar todos"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Setor bloqueado (usuário comum) ─────────────────────────── */
function LockedSectors({ sectorIds, sectors }) {
  const resolved = sectorIds.map((id) => sectors.find((s) => s.id === id)).filter(Boolean);

  return (
    <div className="space-y-1.5">
      <label className="text-[0.8125rem] font-medium text-foreground flex items-center gap-2">
        Setor
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-surface border border-border px-1.5 py-0.5 rounded-md">
          <Lock className="w-2.5 h-2.5" />
          automático
        </span>
      </label>
      <div className="flex flex-wrap gap-1.5 px-3 py-2.5 border border-border rounded-xl bg-surface/40 min-h-[42px] items-center">
        {resolved.length > 0 ? (
          resolved.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-surface border border-border text-foreground"
            >
              {s.icon && <span className="text-sm">{s.icon}</span>}
              {s.name}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground/60">
            Nenhum setor atribuído ao seu perfil.
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/60">
        Definido pelo seu perfil — não pode ser alterado.
      </p>
    </div>
  );
}

/* ── Modal principal ─────────────────────────────────────────── */
export default function PromptEditorModal({ prompt, categories, sectors, onSaved, onClose }) {
  const { userProfile, isAdmin, isSuperAdmin } = useAuth();
  const isEditing = !!prompt;
  const canEditSector = isAdmin || isSuperAdmin;

  // Setores do usuário (para não-admin)
  const userSectorIds = useMemo(() => {
    if (canEditSector) return [];
    return userProfile?.sectorIds?.length
      ? userProfile.sectorIds
      : userProfile?.sectorId && userProfile.sectorId !== "__skipped__"
        ? [userProfile.sectorId]
        : [];
  }, [canEditSector, userProfile]);

  const initialSectorIds = isEditing
    ? toArray(prompt?.sectorIds || prompt?.sectorId)
    : canEditSector
      ? []
      : userSectorIds;

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...(prompt || {}),
    sectorIds: initialSectorIds,
    categoryIds: toArray(prompt?.categoryIds || prompt?.categoryId || prompt?.category_id),
  });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const availableCategories = useMemo(() => {
    if (form.sectorIds.length === 0) return categories;
    return categories.filter((c) => form.sectorIds.includes(c.sectorId));
  }, [categories, form.sectorIds]);

  const handleSectorsChange = (newSectorIds) => {
    const validCategoryIds = form.categoryIds.filter((cid) => {
      const cat = categories.find((c) => c.id === cid);
      return !cat || newSectorIds.length === 0 || newSectorIds.includes(cat.sectorId);
    });
    setForm((f) => ({ ...f, sectorIds: newSectorIds, categoryIds: validCategoryIds }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.warning("Título é obrigatório."); return; }
    if (!form.short_description.trim()) { toast.warning("Descrição curta é obrigatória."); return; }
    if (!form.content.trim()) { toast.warning("Conteúdo do prompt é obrigatório."); return; }
    if (!form.ai_model) { toast.warning("Selecione a IA recomendada."); return; }
    if (!canEditSector && userSectorIds.length === 0) {
      toast.warning("Seu perfil não possui um setor definido. Contate o administrador.");
      return;
    }
    if (form.sectorIds.length === 0) { toast.warning("Selecione ao menos um setor."); return; }
    if (form.categoryIds.length === 0) { toast.warning("Selecione ao menos uma categoria."); return; }

    const payload = { ...form, sectorIds: form.sectorIds, categoryIds: form.categoryIds };

    setSaving(true);
    try {
      if (isEditing) {
        await updatePrompt(prompt.id, payload, userProfile);
        onSaved({ ...prompt, ...payload }, false);
        toast.success("Prompt atualizado!");
      } else {
        const ref = await createPrompt(payload, userProfile);
        onSaved({ id: ref.id, ...payload }, true);
        toast.success("Prompt criado!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar prompt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-background rounded-2xl border border-border shadow-premium flex flex-col z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-foreground text-sm">
            {isEditing ? "Editar prompt" : "Novo prompt"}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <Field label="Título *">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Título do prompt"
              className="input-base"
            />
          </Field>

          <Field label="Descrição curta *">
            <input
              value={form.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              placeholder="Breve descrição do que o prompt faz"
              className="input-base"
            />
          </Field>

          <Field label="Conteúdo do prompt *">
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Insira o prompt completo aqui..."
              rows={6}
              className="input-base resize-none font-mono text-xs leading-relaxed"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="IA recomendada *">
              <NativeSelect value={form.ai_model} onChange={(e) => set("ai_model", e.target.value)}>
                {AI_MODELS.map((ai) => <option key={ai} value={ai}>{ai}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Nível de dificuldade">
              <NativeSelect value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Setor */}
          {canEditSector ? (
            <CheckboxGroup
              label="Setores *"
              options={sectors}
              selected={form.sectorIds}
              onChange={handleSectorsChange}
              emptyText="Nenhum setor cadastrado."
            />
          ) : (
            <LockedSectors sectorIds={form.sectorIds} sectors={sectors} />
          )}

          {/* Categorias */}
          <CheckboxGroup
            label="Categorias *"
            options={availableCategories}
            selected={form.categoryIds}
            onChange={(ids) => set("categoryIds", ids)}
            emptyText={
              form.sectorIds.length > 0
                ? "Nenhuma categoria para o(s) setor(es) selecionado(s)."
                : "Nenhuma categoria cadastrada."
            }
          />

          <Field label="Como usar (opcional)">
            <textarea
              value={form.instructions}
              onChange={(e) => set("instructions", e.target.value)}
              placeholder="Dicas e instruções de uso..."
              rows={3}
              className="input-base resize-none"
            />
          </Field>

          <Field label="Observações (opcional)">
            <textarea
              value={form.observations}
              onChange={(e) => set("observations", e.target.value)}
              placeholder="Notas ou observações adicionais..."
              rows={2}
              className="input-base resize-none"
            />
          </Field>

          {/* Destaque — apenas admins */}
          {canEditSector && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <Checkbox
                checked={form.is_featured}
                onCheckedChange={(v) => set("is_featured", !!v)}
              />
              <span className="text-sm text-foreground">
                Destacar este prompt (aparece na home)
              </span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="cursor-pointer h-9 px-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer flex items-center gap-2 h-9 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isEditing ? "Salvar alterações" : "Criar prompt"}
          </button>
        </div>
      </motion.div>

      <style>{`
        .input-base {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.5rem 0.875rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: color 0.15s, box-shadow 0.15s, border-color 0.15s;
        }
        .input-base:focus {
          border-color: var(--ring);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 30%, transparent);
        }
        .input-base::placeholder {
          color: var(--muted-foreground);
          opacity: 0.55;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[0.8125rem] font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

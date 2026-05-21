import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import PromptCard from "./PromptCard";

/**
 * onEdit / onDelete  — called with the prompt object when the user clicks the action.
 * canEdit / canDelete — (prompt) => boolean — gates whether the button is shown.
 *                       If omitted, the button is never rendered.
 */
export default function PromptGrid({ prompts, categories = [], sectors = [], title, emptyMessage, onEdit, onDelete, canEdit, canDelete }) {
  if (!prompts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {emptyMessage || "Nenhum prompt encontrado"}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Tente ajustar os filtros ou use uma busca diferente.
        </p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <span className="text-xs text-muted-foreground bg-surface px-2 py-0.5 rounded-full">
            {prompts.length}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {prompts.map((prompt, index) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            categories={categories}
            sectors={sectors}
            index={index}
            onEdit={canEdit?.(prompt) && onEdit ? () => onEdit(prompt) : undefined}
            onDelete={canDelete?.(prompt) && onDelete ? () => onDelete(prompt) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

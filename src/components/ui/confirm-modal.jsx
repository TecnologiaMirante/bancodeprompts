import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm bg-background rounded-2xl border border-border shadow-premium p-6 z-10"
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                isDanger ? "bg-destructive/10" : "bg-primary/10"
              }`}
            >
              {isDanger ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <Info className="w-5 h-5 text-primary" />
              )}
            </div>

            <h3 className="font-semibold text-foreground text-base">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-6 justify-end">
              <button
                onClick={onCancel}
                disabled={loading}
                className="h-9 px-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex items-center gap-2 h-9 px-5 text-sm font-medium rounded-xl transition-all disabled:opacity-60 ${
                  isDanger
                    ? "bg-destructive text-white hover:opacity-90"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {loading && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Search, X } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { getPrompts } from "../firebaseClient/prompts";
import { getCategories } from "../firebaseClient/categories";
import { getSectors } from "../firebaseClient/sectors";
import PromptGrid from "../components/prompts/PromptGrid";

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
    </div>
  );
}

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [search, setSearch] = useState("");

  const { data: prompts = [], isLoading } = useQuery({
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

  const favoriteIds = favorites.map((f) => f.promptId);
  const favoritePrompts = prompts.filter((p) => favoriteIds.includes(p.id));

  const filtered = favoritePrompts.filter(
    (p) =>
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.short_description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h1 className="text-xl font-bold text-foreground">Meus favoritos</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Carregando…"
                : `${favoritePrompts.length} prompt${favoritePrompts.length !== 1 ? "s" : ""} salvos`}
            </p>
          </div>
        </div>

        {/* Search — only when there's content */}
        {!isLoading && favoritePrompts.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar nos favoritos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-10 pr-9 border border-border rounded-xl text-sm bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-[3px] focus:ring-ring/30 focus:border-ring transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <PromptGrid
            prompts={filtered}
            categories={categories}
            sectors={sectors}
            emptyMessage={
              search
                ? `Nenhum favorito encontrado para "${search}".`
                : "Você ainda não salvou nenhum prompt como favorito."
            }
          />
        )}

        {/* Search result count */}
        {!isLoading && search && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {filtered.length} de {favoritePrompts.length} favorito{favoritePrompts.length !== 1 ? "s" : ""}
          </p>
        )}
      </motion.div>
    </div>
  );
}

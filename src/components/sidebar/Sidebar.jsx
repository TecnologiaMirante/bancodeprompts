import React from "react";
import { Link } from "react-router-dom";
import {
  Tv,
  Globe,
  TrendingUp,
  Radio,
  Users,
  Cpu,
  Home,
  Heart,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  Tv,
  Globe,
  TrendingUp,
  Radio,
  Users,
  Cpu,
};

export default function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  isOpen,
  onClose,
}) {
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? (
      <IconComponent className="w-5 h-5" />
    ) : (
      <Sparkles className="w-5 h-5" />
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 z-50 transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800 text-lg">
                    Hub de Prompts
                  </h1>
                  <p className="text-xs text-slate-500">TV Mirante</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => {
                  onSelectCategory(null);
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  !selectedCategory
                    ? "bg-linear-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Início</span>
              </Link>

              {/* Vamos comentar Favoritos por enquanto até criar a rota, ou deixar apontando para home filtrada */}
              <button
                onClick={() => alert("Em breve!")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all duration-200"
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">Favoritos</span>
              </button>
            </div>

            <div className="mt-8">
              <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Categorias
              </h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onSelectCategory(category.id);
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                      selectedCategory === category.id
                        ? "bg-linear-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <span style={{ color: category.color }}>
                        {getIcon(category.icon)}
                      </span>
                    </div>
                    <span className="font-medium flex-1 truncate">
                      {category.name}
                    </span>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-slate-400 transition-transform",
                        selectedCategory === category.id && "rotate-90",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <div className="px-4 py-3 bg-linear-to-r from-cyan-50 to-blue-50 rounded-xl">
              <p className="text-xs text-slate-500 text-center">
                Grupo Mirante © 2026
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Função simples para normalizar URLs
export const createPageUrl = (path) => {
  // Se o path já começar com /, retorna ele. Senão, adiciona.
  return path.startsWith("/") ? path : `/${path}`;
};

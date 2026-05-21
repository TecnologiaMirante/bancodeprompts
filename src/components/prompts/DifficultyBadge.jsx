const DIFFICULTY_CONFIG = {
  Iniciante: { color: "#16a34a", bg: "#16a34a12", dot: "#16a34a" },
  Intermediário: { color: "#d97706", bg: "#d9770612", dot: "#d97706" },
  Avançado: { color: "#dc2626", bg: "#dc262612", dot: "#dc2626" },
};

export default function DifficultyBadge({ level }) {
  const config = DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG["Iniciante"];

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      {level}
    </span>
  );
}

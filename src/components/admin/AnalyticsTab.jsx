import { useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Users, Eye, Copy, Star, TrendingUp, Cpu, Layers, BarChart2 } from "lucide-react";
import { AI_CONFIG } from "../prompts/AiBadge";

/* ── Stat card ───────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color = "text-primary", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

/* ── Horizontal bar ──────────────────────────────────────────── */
function BarRow({ label, value, max, icon, color = "#6366f1", subtitle }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      {icon && <span className="text-base w-5 text-center shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-foreground truncate">{label}</span>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">{value.toLocaleString("pt-BR")}</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        {subtitle && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Section card ────────────────────────────────────────────── */
function Section({ icon: Icon, title, children, className = "" }) {
  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ── Top list row ────────────────────────────────────────────── */
function TopRow({ rank, title, value, icon: Icon, iconClass = "" }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs font-bold text-muted-foreground w-4 text-center shrink-0">{rank}</span>
      <p className="flex-1 text-xs font-medium text-foreground truncate">{title}</p>
      <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
        <Icon className={`w-3 h-3 ${iconClass}`} />
        {value.toLocaleString("pt-BR")}
      </span>
    </div>
  );
}

/* ── Difficulty colors ───────────────────────────────────────── */
const DIFF_CONFIG = {
  Iniciante:    { color: "#16a34a", label: "Iniciante" },
  Intermediário:{ color: "#d97706", label: "Intermediário" },
  Avançado:    { color: "#dc2626", label: "Avançado" },
};

/* ── Main component ──────────────────────────────────────────── */
export default function AnalyticsTab({ prompts, users, sectors = [], categories = [] }) {
  const stats = useMemo(() => {
    const totalViews  = prompts.reduce((a, p) => a + (p.viewCount  || 0), 0);
    const totalCopies = prompts.reduce((a, p) => a + (p.copyCount  || 0), 0);
    const featured    = prompts.filter((p) => p.is_featured).length;

    // By AI model
    const byAI = Object.keys(AI_CONFIG).map((ai) => ({
      key: ai,
      count: prompts.filter((p) => p.ai_model === ai).length,
      views: prompts.filter((p) => p.ai_model === ai).reduce((a, p) => a + (p.viewCount || 0), 0),
    })).filter((a) => a.count > 0).sort((a, b) => b.count - a.count);

    // By difficulty
    const byDiff = Object.keys(DIFF_CONFIG).map((d) => ({
      key: d,
      count: prompts.filter((p) => p.difficulty === d).length,
    })).filter((d) => d.count > 0);

    // By sector
    const bySector = sectors.map((s) => {
      const sPrompts = prompts.filter((p) => {
        const ids = p.sectorIds?.length ? p.sectorIds : p.sectorId ? [p.sectorId] : [];
        return ids.includes(s.id);
      });
      return {
        id: s.id,
        name: s.name,
        icon: s.icon,
        count: sPrompts.length,
        views: sPrompts.reduce((a, p) => a + (p.viewCount || 0), 0),
        copies: sPrompts.reduce((a, p) => a + (p.copyCount || 0), 0),
      };
    }).filter((s) => s.count > 0).sort((a, b) => b.count - a.count);

    // Top viewed / copied
    const topViewed = [...prompts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 8);
    const topCopied = [...prompts].sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0)).slice(0, 8);

    // Top contributors
    const contribMap = {};
    prompts.forEach((p) => {
      if (!p.createdByName) return;
      contribMap[p.createdByName] = (contribMap[p.createdByName] || 0) + 1;
    });
    const topContribs = Object.entries(contribMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalViews, totalCopies, featured, byAI, byDiff, bySector, topViewed, topCopied, topContribs };
  }, [prompts, sectors, categories]);

  const maxAI     = Math.max(...stats.byAI.map((a) => a.count), 1);
  const maxSector = Math.max(...stats.bySector.map((s) => s.count), 1);
  const maxDiff   = Math.max(...stats.byDiff.map((d) => d.count), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Analytics</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Visão geral do uso da plataforma.</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={FileText} label="Total de prompts"        value={prompts.length.toLocaleString("pt-BR")} color="text-primary"      delay={0} />
        <StatCard icon={Users}    label="Usuários cadastrados"    value={users.length.toLocaleString("pt-BR")}   color="text-violet-500"   delay={0.04} />
        <StatCard icon={Eye}      label="Total de visualizações"  value={stats.totalViews.toLocaleString("pt-BR")} color="text-blue-500"  delay={0.08} />
        <StatCard icon={Copy}     label="Total de cópias"         value={stats.totalCopies.toLocaleString("pt-BR")} color="text-green-500" delay={0.12} />
        <StatCard icon={Star}     label="Em destaque"             value={stats.featured.toLocaleString("pt-BR")} color="text-amber-500"   delay={0.16} />
      </div>

      {/* ── Row 2: top viewed + top copied ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={Eye} title="Mais visualizados">
          {stats.topViewed.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Sem dados de visualização.</p>
          ) : (
            stats.topViewed.map((p, i) => (
              <TopRow key={p.id} rank={i + 1} title={p.title} value={p.viewCount || 0} icon={Eye} />
            ))
          )}
        </Section>

        <Section icon={TrendingUp} title="Mais copiados">
          {stats.topCopied.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Sem dados de cópia.</p>
          ) : (
            stats.topCopied.map((p, i) => (
              <TopRow key={p.id} rank={i + 1} title={p.title} value={p.copyCount || 0} icon={Copy} />
            ))
          )}
        </Section>
      </div>

      {/* ── Row 3: by AI + by sector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={Cpu} title="Prompts por modelo de IA">
          {stats.byAI.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum dado.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {stats.byAI.map((a) => (
                <BarRow
                  key={a.key}
                  label={a.key}
                  value={a.count}
                  max={maxAI}
                  color={AI_CONFIG[a.key]?.color || "#6366f1"}
                  subtitle={a.views > 0 ? `${a.views.toLocaleString("pt-BR")} visualizações` : undefined}
                />
              ))}
            </div>
          )}
        </Section>

        <Section icon={Layers} title="Prompts por setor">
          {stats.bySector.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum setor com prompts.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {stats.bySector.map((s) => (
                <BarRow
                  key={s.id}
                  label={s.name}
                  value={s.count}
                  max={maxSector}
                  icon={s.icon}
                  color="#6366f1"
                  subtitle={
                    s.views + s.copies > 0
                      ? `${s.views.toLocaleString("pt-BR")} views · ${s.copies.toLocaleString("pt-BR")} cópias`
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* ── Row 4: by difficulty + top contributors ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={BarChart2} title="Prompts por nível">
          {stats.byDiff.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum dado.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {stats.byDiff.map((d) => (
                <BarRow
                  key={d.key}
                  label={d.key}
                  value={d.count}
                  max={maxDiff}
                  color={DIFF_CONFIG[d.key]?.color || "#6366f1"}
                  subtitle={`${Math.round((d.count / prompts.length) * 100)}% do total`}
                />
              ))}
            </div>
          )}
        </Section>

        <Section icon={Users} title="Maiores contribuidores">
          {stats.topContribs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Sem dados de criadores.</p>
          ) : (
            stats.topContribs.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
                <span className="text-xs font-bold text-muted-foreground w-4 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {c.count} prompt{c.count !== 1 ? "s" : ""}
                </span>
              </div>
            ))
          )}
        </Section>
      </div>
    </div>
  );
}

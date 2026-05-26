import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Heart, User, Shield, LogOut, Moon, Sun, Zap, ChevronLeft, Clock,
} from "lucide-react";
import logoClaro  from "../../assets/logo_claro.png";
import logoEscuro from "../../assets/logo_escuro.png";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { ConfirmModal } from "../ui/confirm-modal";

const NAV_ITEMS = [
  { to: "/",          icon: Home,  label: "Início",     exact: true  },
  { to: "/favorites", icon: Heart, label: "Favoritos",  exact: false },
  { to: "/history",   icon: Clock, label: "Histórico",  exact: false },
  { to: "/profile",   icon: User,  label: "Meu perfil", exact: false },
];

/* Timing helpers — text fades out before container narrows,
   text fades in after container expands.                      */
const labelTransition = (collapsed) => ({
  opacity: { duration: 0.12, delay: collapsed ? 0    : 0.16 },
  width:   { type: "spring", stiffness: 300, damping: 30, delay: collapsed ? 0.08 : 0 },
});

const blockTransition = (collapsed) => ({
  opacity: { duration: 0.14, delay: collapsed ? 0    : 0.16 },
  height:  { type: "spring", stiffness: 300, damping: 30, delay: collapsed ? 0.08 : 0 },
});

/* ── NavItem ─────────────────────────────────────────────────── */
function NavItem({ to, icon: Icon, label, exact, collapsed }) {
  const { pathname } = useLocation();
  const active = exact ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`relative flex items-center gap-3 rounded-xl text-sm font-medium transition-colors duration-150 group overflow-hidden
        ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
        ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-surface"}`}
    >
      {/* Active accent bar */}
      <AnimatePresence>
        {active && !collapsed && (
          <motion.span
            layoutId="sidebar-accent"
            className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-full bg-primary"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      <motion.span
        whileHover={!active ? { scale: 1.18, rotate: -4 } : {}}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        className={`shrink-0 ${active ? "text-primary" : ""}`}
      >
        <Icon className="w-4 h-4" />
      </motion.span>

      {/* Label — animates in-place, no mount/unmount flicker */}
      <motion.span
        animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
        transition={labelTransition(collapsed)}
        className="truncate whitespace-nowrap overflow-hidden"
        style={{ display: "block" }}
      >
        {label}
      </motion.span>
    </Link>
  );
}

/* ── Inline label used by bottom buttons ────────────────────── */
function BtnLabel({ collapsed, children }) {
  return (
    <motion.span
      animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
      transition={labelTransition(collapsed)}
      className="truncate whitespace-nowrap overflow-hidden"
      style={{ display: "block" }}
    >
      {children}
    </motion.span>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────── */
export default function Sidebar({ collapsed, onToggle }) {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut]               = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); navigate("/login"); }
    finally { setLoggingOut(false); setShowLogoutConfirm(false); }
  };

  const initials = userProfile?.display_name
    ? userProfile.display_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 68 : 248 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.85 }}
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 bg-card border-r border-border z-40 overflow-visible"
      >
        {/* ── Toggle tab — right edge, vertically centred ── */}
        <button
          onClick={onToggle}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className="cursor-pointer absolute top-1/2 -translate-y-1/2 z-50 w-[22px] h-[22px] flex items-center justify-center rounded-full bg-card border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 hover:scale-110 transition-all duration-200"
          style={{ right: -11 }}
        >
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <ChevronLeft className="w-3 h-3" />
          </motion.span>
        </button>

        {/* ── Logo ── */}
        <div className="flex items-center h-[60px] shrink-0 border-b border-border overflow-hidden px-4">
          <Link to="/" className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
            <motion.img
              src={dark ? logoEscuro : logoClaro}
              alt="TV Mirante"
              animate={{ height: collapsed ? 20 : 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-auto object-contain shrink-0"
            />
            <motion.span
              animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
              transition={labelTransition(collapsed)}
              className="text-xs font-bold tracking-[0.12em] uppercase text-foreground/70 whitespace-nowrap overflow-hidden"
              style={{ display: "block" }}
            >
              Banco de Prompts
            </motion.span>
          </Link>
        </div>

        {/* ── Navigation ── */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 transition-all duration-200 ${collapsed ? "px-2" : "px-3"}`}>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}

          {isAdmin && (
            <>
              <div className="my-3 h-px bg-border mx-1" />
              <motion.p
                animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
                transition={blockTransition(collapsed)}
                className="px-3 pb-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.1em] overflow-hidden"
              >
                Administração
              </motion.p>
              <NavItem to="/admin" icon={Shield} label="Painel Admin" exact={false} collapsed={collapsed} />
            </>
          )}

          {/* Feature badge */}
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
            transition={blockTransition(collapsed)}
            className="overflow-hidden"
          >
            <div className="mt-6 mx-1 p-3 rounded-xl border border-primary/15 bg-primary/5">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-semibold text-primary">Banco de Prompts</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Potencialize sua equipe com prompts de IA organizados por setor.
              </p>
            </div>
          </motion.div>
        </nav>

        {/* ── Bottom ── */}
        <div className={`shrink-0 border-t border-border py-3 space-y-1 transition-all duration-200 ${collapsed ? "px-2" : "px-3"}`}>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            title={collapsed ? (dark ? "Modo claro" : "Modo escuro") : undefined}
            className={`cursor-pointer w-full flex items-center gap-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors duration-150 overflow-hidden
              ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={dark ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                exit={{ opacity: 0, rotate: 20, scale: 0.8 }}
                transition={{ duration: 0.18 }}
                className="shrink-0 flex items-center justify-center"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.span>
            </AnimatePresence>
            <BtnLabel collapsed={collapsed}>{dark ? "Modo claro" : "Modo escuro"}</BtnLabel>
          </button>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={collapsed ? "Sair da conta" : undefined}
            className={`cursor-pointer w-full flex items-center gap-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors duration-150 overflow-hidden
              ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <BtnLabel collapsed={collapsed}>Sair da conta</BtnLabel>
          </button>

          {/* User card */}
          <div className={`flex items-center gap-3 rounded-xl bg-surface mt-1 overflow-hidden
            ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2.5"}`}
          >
            {userProfile?.photo_url || user?.picture ? (
              <img
                src={userProfile?.photo_url || user?.picture}
                alt={userProfile?.display_name}
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold shrink-0">
                {initials}
              </div>
            )}
            <motion.div
              animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
              transition={labelTransition(collapsed)}
              className="min-w-0 overflow-hidden"
              style={{ display: "block" }}
            >
              <p className="text-xs font-semibold text-foreground truncate leading-tight whitespace-nowrap">
                {userProfile?.display_name?.split(" ")[0] || "Usuário"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate whitespace-nowrap">
                {userProfile?.typeUser || "user"}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.aside>

      {/* Logout confirm */}
      <ConfirmModal
        open={showLogoutConfirm}
        title="Sair da conta"
        description="Tem certeza que deseja encerrar sua sessão?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        variant="danger"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

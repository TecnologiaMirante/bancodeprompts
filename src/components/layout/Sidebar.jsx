import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Heart, User, Shield, LogOut, Moon, Sun, Zap } from "lucide-react";
import logoMirante from "../../assets/logo_mirante.png";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/",         icon: Home,   label: "Início",    exact: true  },
  { to: "/favorites",icon: Heart,  label: "Favoritos", exact: false },
  { to: "/profile",  icon: User,   label: "Meu perfil",exact: false },
];

function NavItem({ to, icon: Icon, label, exact }) {
  const { pathname } = useLocation();
  const active = exact ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-surface"
      }`}
    >
      {/* Active left accent */}
      <AnimatePresence>
        {active && (
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
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const initials = userProfile?.display_name
    ? userProfile.display_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-[248px] bg-card border-r border-border z-40">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-3 h-[60px] px-5 shrink-0 border-b border-border hover:bg-surface/50 transition-colors"
      >
        <img
          src={logoMirante}
          alt="TV Mirante"
          className="h-6 w-auto object-contain shrink-0"
          style={{ filter: dark ? "brightness(0) invert(1)" : "brightness(0)" }}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold tracking-[0.12em] uppercase text-foreground/70 truncate">
            Banco de Prompts
          </span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="my-3 mx-1 h-px bg-border" />
            <p className="px-3 pb-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.1em]">
              Administração
            </p>
            <NavItem to="/admin" icon={Shield} label="Painel Admin" exact={false} />
          </>
        )}

        {/* Feature badge */}
        <div className="mt-6 mx-1 p-3 rounded-xl border border-primary/15 bg-primary/5">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Banco de Prompts</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Potencialize sua equipe com prompts de IA organizados por setor.
          </p>
        </div>
      </nav>

      {/* Bottom: theme + user */}
      <div className="shrink-0 border-t border-border p-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-all duration-200"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={dark ? "sun" : "moon"}
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 20 }}
              transition={{ duration: 0.18 }}
              className="w-4 h-4 shrink-0 flex items-center justify-center"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.span>
          </AnimatePresence>
          {dark ? "Modo claro" : "Modo escuro"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair da conta
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface mt-1">
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
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate leading-tight">
              {userProfile?.display_name?.split(" ")[0] || "Usuário"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {userProfile?.typeUser || "user"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

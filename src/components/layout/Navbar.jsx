import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, LogOut, Moon, Sun, Shield, ChevronDown, Menu } from "lucide-react";
import logoMirante from "../../assets/logo_mirante.png";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { ConfirmModal } from "../ui/confirm-modal";

const PAGE_TITLES = {
  "/":          "Início",
  "/favorites": "Favoritos",
  "/profile":   "Meu Perfil",
  "/admin":     "Painel Admin",
};

function usePageTitle() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return "Painel Admin";
  if (pathname.startsWith("/prompt/")) return "Detalhes do Prompt";
  return PAGE_TITLES[pathname] || "";
}

export default function Navbar() {
  const { user, userProfile, isAdmin: isAdminUser, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = usePageTitle();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isFavorites = location.pathname === "/favorites";
  const isAdminPath = location.pathname.startsWith("/admin");
  const isProfilePath = location.pathname === "/profile";
  const showFavorites = !isAdminPath && !isProfilePath;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const initials = userProfile?.display_name
    ? userProfile.display_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      <header
        className={`h-[56px] sticky top-0 z-30 flex items-center shrink-0 transition-all duration-300 ${
          scrolled
            ? "navbar-glass shadow-sm"
            : "bg-background/0"
        }`}
      >
        {scrolled && (
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(99,102,241,0.35) 30%, rgba(79,70,229,0.5) 50%, rgba(99,102,241,0.35) 70%, transparent)",
            }}
          />
        )}

        <div className="flex items-center w-full px-4 sm:px-6 gap-3">
          {/* Mobile: logo | Desktop: page title */}
          <div className="flex-1 min-w-0">
            {/* Logo — mobile only (sidebar has it on desktop) */}
            <Link to="/" className="lg:hidden flex items-center gap-3 group">
              <img
                src={logoMirante}
                alt="TV Mirante"
                className="h-6 w-auto object-contain"
                style={{ filter: dark ? "brightness(0) invert(1)" : "none" }}
              />
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/70">
                Banco de Prompts
              </span>
            </Link>

            {/* Page title — desktop only */}
            {pageTitle && (
              <AnimatePresence mode="wait">
                <motion.h1
                  key={pageTitle}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="hidden lg:block text-sm font-semibold text-foreground"
                >
                  {pageTitle}
                </motion.h1>
              </AnimatePresence>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Favorites — mobile only (sidebar has nav on desktop) */}
            {showFavorites && (
              <Link
                to="/favorites"
                className={`lg:hidden cursor-pointer w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                  isFavorites
                    ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
                title="Favoritos"
              >
                <Heart
                  className="w-4 h-4"
                  fill={isFavorites ? "currentColor" : "none"}
                />
              </Link>
            )}

            {/* Theme toggle — mobile only (sidebar has it on desktop) */}
            <button
              onClick={toggleTheme}
              className="lg:hidden cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition-all duration-200"
              title={dark ? "Modo claro" : "Modo escuro"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={dark ? "sun" : "moon"}
                  initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-center"
                >
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* User menu — visible on all breakpoints */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="cursor-pointer flex items-center gap-2 h-8 px-2.5 rounded-full border border-transparent hover:border-border hover:bg-surface transition-all duration-200 ml-1"
              >
                {userProfile?.photo_url || user?.picture ? (
                  <img
                    src={userProfile?.photo_url || user?.picture}
                    alt={userProfile?.display_name}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-semibold">
                    {initials}
                  </div>
                )}
                <span className="hidden sm:block text-xs font-medium text-foreground max-w-[90px] truncate">
                  {userProfile?.display_name?.split(" ")[0] || "Usuário"}
                </span>
                <ChevronDown
                  className={`hidden sm:block w-3 h-3 text-muted-foreground/60 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-popover shadow-elevated overflow-hidden z-20"
                    >
                      {/* User header */}
                      <div className="px-4 py-4 bg-surface/60">
                        <div className="flex items-center gap-3">
                          {userProfile?.photo_url || user?.picture ? (
                            <img
                              src={userProfile?.photo_url || user?.picture}
                              alt={userProfile?.display_name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-semibold shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                              {userProfile?.display_name || "Usuário"}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {user?.email}
                            </p>
                            <span className="inline-flex mt-1.5 text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                              {userProfile?.typeUser || "user"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5">
                        <DropdownItem icon={User} label="Meu perfil" onClick={() => { navigate("/profile"); setUserMenuOpen(false); }} />
                        {isAdminUser && (
                          <DropdownItem icon={Shield} label="Painel Admin" onClick={() => { navigate("/admin"); setUserMenuOpen(false); }} />
                        )}
                        <div className="h-px bg-border my-1 mx-2" />
                        <DropdownItem icon={LogOut} label="Sair da conta" onClick={() => { setUserMenuOpen(false); setShowLogoutConfirm(true); }} danger />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

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

function DropdownItem({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-all duration-150 ${
        danger ? "text-destructive hover:bg-destructive/8" : "text-foreground hover:bg-surface"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0 opacity-70" />
      {label}
    </button>
  );
}

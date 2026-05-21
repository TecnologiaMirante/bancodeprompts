import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Shield,
  LogOut,
  Moon,
  Sun,
  Heart,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ConfirmModal } from "../components/ui/confirm-modal";

const ROLE_LABELS = {
  user: {
    label: "Usuário",
    className:
      "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  },
  admin: {
    label: "Admin",
    className:
      "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
  },
  superadmin: {
    label: "Super Admin",
    className:
      "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
  },
};

export default function ProfilePage() {
  const { user, userProfile, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = ROLE_LABELS[userProfile?.typeUser] || ROLE_LABELS.user;

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
    ? userProfile.display_name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {/* Page title */}
          <div>
            <h1 className="text-xl font-bold text-foreground">Meu perfil</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gerencie suas informações e preferências.
            </p>
          </div>

          {/* Profile card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
            {/* Avatar header */}
            <div className="px-5 sm:px-6 py-5 border-b border-border flex items-center gap-4">
              {userProfile?.photo_url || user?.picture ? (
                <img
                  src={userProfile?.photo_url || user?.picture}
                  alt={userProfile?.display_name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-border shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-semibold text-xl flex items-center justify-center shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-semibold text-foreground truncate">
                  {userProfile?.display_name || user?.name || "Usuário"}
                </h2>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {user?.email}
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md mt-1.5 ${role.className}`}
                >
                  <Shield className="w-2.5 h-2.5" />
                  {role.label}
                </span>
              </div>
            </div>

            {/* Info rows */}
            <div className="divide-y divide-border">
              <div className="flex items-center gap-3 px-5 sm:px-6 py-4">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    E-mail
                  </p>
                  <p className="text-sm text-foreground truncate">
                    {user?.email || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
            <div className="px-5 sm:px-6 py-4 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Preferências
              </p>
            </div>
            <div className="divide-y divide-border">
              {/* Theme toggle */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4">
                <div className="flex items-center gap-3">
                  {dark ? (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      Aparência
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dark ? "Modo escuro" : "Modo claro"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  role="switch"
                  aria-checked={dark}
                  className={`cursor-pointer relative inline-flex h-[22px] w-10 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    dark ? "bg-primary" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-200 ${
                      dark ? "translate-x-[19px] translate-y-[2px]" : "translate-x-[2px] translate-y-[2px]"
                    }`}
                  />
                </button>
              </div>

              {/* Quick links */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      Favoritos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Seus prompts salvos
                    </p>
                  </div>
                </div>
                <Link
                  to="/favorites"
                  className="text-xs text-primary hover:underline"
                >
                  Ver todos →
                </Link>
              </div>

              <div className="flex items-center justify-between px-5 sm:px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      Prompts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Explorar a biblioteca
                    </p>
                  </div>
                </div>
                <Link to="/" className="text-xs text-primary hover:underline">
                  Ir →
                </Link>
              </div>
            </div>
          </div>

          {/* Session card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
            <div className="px-5 sm:px-6 py-4 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sessão
              </p>
            </div>
            <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Encerrar sessão
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Você será desconectado da plataforma.
                </p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="cursor-pointer flex items-center gap-2 h-9 px-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Sair da conta"
        description="Tem certeza que deseja encerrar sua sessão? Você precisará fazer login novamente."
        confirmLabel="Sair"
        variant="danger"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

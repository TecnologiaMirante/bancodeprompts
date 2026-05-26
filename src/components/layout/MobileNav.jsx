import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Heart, Clock, Shield, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function MobileNav() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const items = [
    { to: "/",         icon: Home,  label: "Início"    },
    { to: "/favorites",icon: Heart, label: "Favoritos" },
    { to: "/history",  icon: Clock, label: "Histórico" },
    { to: "/profile",  icon: User,  label: "Perfil"    },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
      {/* Glass panel */}
      <div
        className="mx-3 mb-3 rounded-2xl border border-border overflow-hidden"
        style={{
          background: "var(--navbar-bg)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center justify-around px-1 py-1 pb-safe">
          {items.map(({ to, icon: Icon, label }) => {
            const active =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className="relative flex flex-col items-center gap-1 px-5 py-2.5 min-w-[56px] group"
              >
                {/* Active pill background */}
                <AnimatePresence>
                  {active && (
                    <motion.span
                      layoutId="mobile-nav-pill"
                      className="absolute inset-x-1 inset-y-0.5 rounded-xl bg-primary/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  animate={{
                    color: active ? "var(--primary)" : "var(--muted-foreground)",
                    scale: active ? 1 : 1,
                  }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.18 }}
                  className="relative z-10 flex flex-col items-center gap-1"
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium leading-none transition-colors duration-200 ${
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

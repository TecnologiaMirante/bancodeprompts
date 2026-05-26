import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import MouseFollower from "../ui/MouseFollower";
import { getCategories } from "../../firebaseClient/categories";
import { getSectors } from "../../firebaseClient/sectors";

const LayoutContext = createContext(null);
export function useLayoutContext() { return useContext(LayoutContext); }

const SIDEBAR_EXPANDED  = 248;
const SIDEBAR_COLLAPSED = 68;

export default function AppLayout({ children }) {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
  });

  const toggleSidebar = () =>
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem("sidebar-collapsed", String(next)); } catch {}
      return next;
    });

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: sectors    = [] } = useQuery({ queryKey: ["sectors"],    queryFn: getSectors });

  const pl = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <LayoutContext.Provider value={{ sectors, categories }}>
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

        {/* Content — transitions with sidebar width */}
        <motion.div
          animate={{ paddingLeft: pl }}
          transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
          className="hidden lg:flex flex-col min-h-screen"
        >
          <main className="flex-1 pb-8 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ minHeight: "100%" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>

        {/* Mobile layout (unchanged) */}
        <div className="lg:hidden flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-28 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ minHeight: "100%" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <MobileNav />
        <MouseFollower />
      </div>
    </LayoutContext.Provider>
  );
}

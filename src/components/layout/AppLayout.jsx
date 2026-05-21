import { createContext, useContext } from "react";
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

export function useLayoutContext() {
  return useContext(LayoutContext);
}

export default function AppLayout({ children }) {
  const location = useLocation();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors"],
    queryFn: getSectors,
  });

  return (
    <LayoutContext.Provider value={{ sectors, categories }}>
      <div className="min-h-screen bg-background">
        <Sidebar />

        <div className="lg:pl-[248px] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-28 lg:pb-8 overflow-hidden">
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

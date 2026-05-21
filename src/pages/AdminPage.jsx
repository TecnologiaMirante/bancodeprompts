import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  Layers,
  Tag,
  BarChart2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getPrompts } from "../firebaseClient/prompts";
import { getUsers } from "../firebaseClient/users";
import { getSectors } from "../firebaseClient/sectors";
import { getCategories } from "../firebaseClient/categories";

import PromptsTab from "../components/admin/PromptsTab";
import UsersTab from "../components/admin/UsersTab";
import SectorsTab from "../components/admin/SectorsTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import AnalyticsTab from "../components/admin/AnalyticsTab";

const TABS = [
  { key: "prompts", icon: FileText, label: "Prompts" },
  { key: "users", icon: Users, label: "Usuários" },
  { key: "sectors", icon: Layers, label: "Setores" },
  { key: "categories", icon: Tag, label: "Categorias" },
  { key: "analytics", icon: BarChart2, label: "Analytics" },
];

export default function AdminPage() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("prompts");

  const [prompts, setPrompts] = useState([]);
  const [users, setUsers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [p, u, s, c] = await Promise.all([
        getPrompts().catch(() => []),
        getUsers().catch(() => []),
        getSectors().catch(() => []),
        getCategories().catch(() => []),
      ]);
      setPrompts(p);
      setUsers(u);
      setSectors(s);
      setCategories(c);
      setLoading(false);
    }
    load();
  }, [isAdmin]);

  return (
    <div className="flex flex-col">
      {/* Admin sub-nav */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6 flex items-center gap-3 h-12">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Voltar</span>
          </button>

          <div className="w-px h-4 bg-border shrink-0" />

          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
            {TABS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`cursor-pointer flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeTab === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 pb-16 lg:pb-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "prompts" && (
              <PromptsTab
                prompts={prompts}
                setPrompts={setPrompts}
                categories={categories}
                sectors={sectors}
              />
            )}
            {activeTab === "users" && (
              <UsersTab
                users={users}
                setUsers={setUsers}
                sectors={sectors}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            {activeTab === "sectors" && (
              <SectorsTab
                sectors={sectors}
                setSectors={setSectors}
                categories={categories}
                prompts={prompts}
              />
            )}
            {activeTab === "categories" && (
              <CategoriesTab
                categories={categories}
                setCategories={setCategories}
                sectors={sectors}
                prompts={prompts}
              />
            )}
            {activeTab === "analytics" && (
              <AnalyticsTab
                prompts={prompts}
                users={users}
                sectors={sectors}
                categories={categories}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

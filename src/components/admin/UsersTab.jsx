import { useState } from "react";
import { Search, Shield, ChevronRight } from "lucide-react";
import { updateUser } from "../../firebaseClient/users";
import { Button } from "../ui/button";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: "user", label: "Usuário" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super Admin" },
];

const ROLE_STYLE = {
  user: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  admin:
    "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
  superadmin:
    "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
};

export default function UsersTab({ users, setUsers, sectors, isSuperAdmin }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [roleEdit, setRoleEdit] = useState("");
  const [sectorEdit, setSectorEdit] = useState([]);
  const [saving, setSaving] = useState(false);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (u) => {
    setSelected(u);
    setRoleEdit(u.typeUser || "user");
    setSectorEdit(u.sectorIds || (u.sectorId ? [u.sectorId] : []));
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const uid = selected.id || selected.uid;
      await updateUser(uid, {
        typeUser: roleEdit,
        sectorIds: sectorEdit,
        sectorId: sectorEdit[0] || null,
      });
      setUsers((prev) =>
        prev.map((u) =>
          (u.id || u.uid) === uid
            ? {
                ...u,
                typeUser: roleEdit,
                sectorIds: sectorEdit,
                sectorId: sectorEdit[0],
              }
            : u,
        ),
      );
      setSelected((s) => ({
        ...s,
        typeUser: roleEdit,
        sectorIds: sectorEdit,
        sectorId: sectorEdit[0],
      }));
      toast.success("Usuário atualizado.");
    } catch (e) {
      toast.error("Erro ao atualizar usuário.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSector = (id) => {
    setSectorEdit((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const getSectorName = (id) => sectors.find((s) => s.id === id)?.name || id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">Usuários</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado
          {users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        {/* User list */}
        <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-surface border border-border rounded-lg text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 max-h-125">
            {filtered.map((u) => {
              const uid = u.id || u.uid;
              const isSelected = (selected?.id || selected?.uid) === uid;
              return (
                <button
                  key={uid}
                  onClick={() => handleSelect(u)}
                  className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-border/50 last:border-0 transition-colors ${
                    isSelected ? "bg-primary/5" : "hover:bg-surface"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                    {(u.display_name || u.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {u.display_name || "Sem nome"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {u.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                        ROLE_STYLE[u.typeUser] || ROLE_STYLE.user
                      }`}
                    >
                      {u.typeUser || "user"}
                    </span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground opacity-50" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* User detail */}
        {selected ? (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
            {/* User info */}
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold text-lg flex items-center justify-center">
                {(selected.display_name ||
                  selected.email ||
                  "U")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {selected.display_name || "Sem nome"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selected.email}
                </p>
              </div>
            </div>

            {/* Role */}
            {isSuperAdmin && (
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  Nível de acesso
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRoleEdit(opt.value)}
                      className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        roleEdit === opt.value
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sectors */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Setores de acesso
              </label>
              <div className="flex flex-wrap gap-2">
                {sectors.map((s) => {
                  const isSelected = sectorEdit.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSector(s.id)}
                      className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              {sectorEdit.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Setores: {sectorEdit.map(getSectorName).join(", ")}
                </p>
              )}
            </div>

            {/* Save */}
            <Button onClick={handleSave} disabled={saving}>
              {saving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Salvar alterações
            </Button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl flex items-center justify-center text-center p-12">
            <div>
              <p className="text-sm text-muted-foreground">
                Selecione um usuário para editar suas permissões.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

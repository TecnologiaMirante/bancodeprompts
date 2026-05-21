import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseClient/config";
import { getUserProfile, createUser } from "../firebaseClient/users";
import { logout as firebaseLogout } from "../firebaseClient/auth";
import { toast } from "sonner";

const ALLOWED_DOMAIN = "mirante.com.br";

const AuthContext = createContext(null);

async function bootstrapUserProfile(firebaseUser) {
  let profile = await getUserProfile(firebaseUser.uid);
  if (!profile) {
    await createUser(firebaseUser.uid, {
      uid: firebaseUser.uid,
      display_name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photo_url: firebaseUser.photoURL || "",
      typeUser: "user",
      sectorIds: [],
      sectorId: null,
    });
    profile = await getUserProfile(firebaseUser.uid);
  }
  return profile;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [domainError, setDomainError] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const loadProfile = useCallback(async (firebaseUser) => {
    setProfileError(null);
    try {
      const profile = await bootstrapUserProfile(firebaseUser);
      setUserProfile(profile);
    } catch (e) {
      console.error("Erro ao buscar/criar perfil:", e);
      const message = e?.message || "Erro desconhecido";
      setProfileError(message);
      setUserProfile(null);
      toast.error("Não foi possível criar seu perfil no Firestore.", {
        description: message,
        action: {
          label: "Tentar novamente",
          onClick: () => loadProfile(firebaseUser),
        },
        duration: 10000,
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
          await signOut(auth);
          setUser(null);
          setUserProfile(null);
          setDomainError(true);
          setLoading(false);
          return;
        }

        setDomainError(false);

        const baseUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          picture: firebaseUser.photoURL,
          given_name: firebaseUser.displayName?.split(" ")[0] || "",
          family_name: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
        };
        setUser(baseUser);
        await loadProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        setProfileError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile]);

  const logout = async () => {
    await firebaseLogout();
    setUser(null);
    setUserProfile(null);
    setDomainError(false);
    setProfileError(null);
  };

  const refreshProfile = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    try {
      const profile = await getUserProfile(firebaseUser.uid);
      setUserProfile(profile);
    } catch (e) {
      console.error("Erro ao atualizar perfil:", e);
    }
  };

  const retryProfileCreation = () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) loadProfile(firebaseUser);
  };

  const isAdmin =
    userProfile?.typeUser === "admin" || userProfile?.typeUser === "superadmin";
  const isSuperAdmin = userProfile?.typeUser === "superadmin";
  const needsSectorSetup =
    !!user &&
    !!userProfile &&
    !isAdmin &&
    !userProfile?.sectorId &&
    !userProfile?.sectorIds?.length;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isSuperAdmin,
        needsSectorSetup,
        domainError,
        profileError,
        retryProfileCreation,
        logout,
        loading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

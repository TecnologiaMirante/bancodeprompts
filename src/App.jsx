import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import { getPrompts } from "./firebaseClient/prompts";
import { getCategories } from "./firebaseClient/categories";
import { getSectors } from "./firebaseClient/sectors";

import AppLayout from "./components/layout/AppLayout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import SessionTracker from "./components/SessionTracker";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import PromptDetailPage from "./pages/PromptDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function DataPrefetcher() {
  const { user, isGuest } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user && !isGuest) return;
    qc.prefetchQuery({ queryKey: ["prompts"], queryFn: getPrompts });
    qc.prefetchQuery({ queryKey: ["categories"], queryFn: getCategories });
    qc.prefetchQuery({ queryKey: ["sectors"], queryFn: getSectors });
  }, [!!user, isGuest]);

  return null;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
          <div className="w-5 h-5 rounded-md bg-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, isGuest, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user || isGuest ? children : <Navigate to="/login" replace />;
}

function GuestBlockedRoute({ children }) {
  const { user, isGuest, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user && !isGuest) return <Navigate to="/login" replace />;
  if (isGuest) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, isGuest, loading } = useAuth();
  if (loading) return null;
  return user || isGuest ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/prompt/:id"
        element={
          <PrivateRoute>
            <AppLayout>
              <PromptDetailPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <GuestBlockedRoute>
            <AppLayout>
              <FavoritesPage />
            </AppLayout>
          </GuestBlockedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <GuestBlockedRoute>
            <AppLayout>
              <HistoryPage />
            </AppLayout>
          </GuestBlockedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <GuestBlockedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </GuestBlockedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AppLayout>
              <AdminPage />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <DataPrefetcher />
            <SessionTracker />
            <ProfileSetupModal />
            <AppRoutes />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

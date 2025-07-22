import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Candidates from "./pages/Candidates";
import Matching from "./pages/Matching";
import Email from "./pages/Email";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import EmailAnalysis from "./pages/EmailAnalysis";
import BatchMatching from "./pages/BatchMatching";
import BulkEmail from "./pages/BulkEmail";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ToastProvider } from "@/hooks/toast/toast-provider";
import { DebugPanel } from "@/components/layout/DebugPanel"; // 添加这一行
import AuthDebug from "./pages/AuthDebug";
import TestPage from "./pages/TestPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useState, useEffect, createContext, useContext } from "react";
import { invoke } from "@tauri-apps/api/core";
import { setApiBase } from "./utils/backend-api";
import { set_aimatching } from "./services/aiMatchingService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export const BackendPortContext = createContext<number | undefined>(undefined);

const App = () => {
  const [backendPort, setBackendPort] = useState<number | undefined>(undefined);
  const [backendReady, setBackendReady] = useState<boolean>(false);
  useEffect(() => {
    invoke<number>("get_backend_port")
      .then((port) => {
        console.log("Backend port from Rust:", port);
        setBackendPort(port);
        setApiBase(port);
        set_aimatching(`http://localhost:${port}`);
      })
      .catch((err) => {
        console.error("Failed to get backend port:", err);
      });

    invoke<string>("get_backend_log")
      .then((backend_log) => {
        console.log("backend log: ", backend_log);
      })
      .catch((err) => {
        console.error("Failed to get backend port:", err);
      });

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:${backendPort}`, {
          method: "GET",
        });
        if (res.ok) {
          setBackendReady(true);
          clearInterval(interval);
        }
      } catch (err) {
        // not ready yet
      }
    }, 500); // retry every 500ms

    return () => clearInterval(interval);
  });

  if (!backendPort) {
    return null;
  }

  if (!backendReady) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }
  return (
    <ErrorBoundary>
      <BackendPortContext.Provider value={backendPort}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <TooltipProvider>
              <AuthProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/auth" element={<Auth />} />

                    {/* Protected routes */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/test"
                      element={
                        <ProtectedRoute>
                          <TestPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/protected"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Own company routes */}
                    <Route
                      path="/cases/company/own"
                      element={
                        <ProtectedRoute>
                          <Cases companyType="own" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/candidates/company/own"
                      element={
                        <ProtectedRoute>
                          <Candidates companyType="own" />
                        </ProtectedRoute>
                      }
                    />

                    {/* Other company routes */}
                    <Route
                      path="/cases/company/other"
                      element={
                        <ProtectedRoute>
                          <Cases companyType="other" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/candidates/company/other"
                      element={
                        <ProtectedRoute>
                          <Candidates companyType="other" />
                        </ProtectedRoute>
                      }
                    />

                    {/* Legacy route - redirect handling */}
                    <Route
                      path="/cases"
                      element={
                        <ProtectedRoute>
                          <Navigate to="/cases/company/own" replace />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/candidates"
                      element={
                        <ProtectedRoute>
                          <Navigate to="/candidates/company/own" replace />
                        </ProtectedRoute>
                      }
                    />

                    {/* Other routes */}
                    <Route
                      path="/matching"
                      element={
                        <ProtectedRoute>
                          <Matching />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/batch-matching"
                      element={
                        <ProtectedRoute>
                          <BatchMatching />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/email"
                      element={
                        <ProtectedRoute>
                          <Email />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bulk-email"
                      element={
                        <ProtectedRoute>
                          <BulkEmail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/email-analysis"
                      element={
                        <ProtectedRoute>
                          <EmailAnalysis />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/auth-debug" element={<AuthDebug />} />
                  </Routes>
                </BrowserRouter>
                {/* 添加调试面板 - 只在开发环境显示 */}
                <DebugPanel />
              </AuthProvider>
            </TooltipProvider>
          </ToastProvider>
        </QueryClientProvider>
      </BackendPortContext.Provider>
    </ErrorBoundary>
  );
};

export function useBackendPort(): number {
  const port = useContext(BackendPortContext);

  if (port === undefined) {
    throw new Error(
      "Backend port is not available yet. Make sure you're using BackendPortProvider and the port has been initialized."
    );
  }

  return port;
}

export default App;

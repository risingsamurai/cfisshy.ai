import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import { Skeleton } from "./components/ui/Skeleton";
import { firebaseEnabled } from "./lib/firebase";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-3 p-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  console.log("🔥 Firebase Enabled (App):", firebaseEnabled);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-primary 
                   focus:text-white focus:rounded-lg focus:shadow-lg
                   focus:outline-none focus:ring-2 focus:ring-brand-secondary"
      >
        Skip to main content
      </a>
      <Routes>
        <Route path="/" element={<Auth />} />
        
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" />
    </>
  );
}

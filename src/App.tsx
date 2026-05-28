import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import MatchDetail from '@/pages/MatchDetail';
import History from '@/pages/History';
import Profile from '@/pages/Profile';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
        <div className="text-amber-400 text-xl">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router basename="/bobo.github.io">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/match/:id"
          element={
            <PrivateRoute>
              <MatchDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

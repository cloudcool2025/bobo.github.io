import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import MatchDetail from '@/pages/MatchDetail';
import History from '@/pages/History';
import Profile from '@/pages/Profile';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized, initialize, signOut } = useAuthStore();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleForceLogout = async () => {
    await signOut();
    window.location.reload();
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center flex-col gap-4">
        <div className="text-amber-400 text-xl">加载中...</div>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-amber-300 text-sm underline"
        >
          显示调试信息
        </button>
        {showDebug && (
          <div className="text-amber-200 text-sm p-4 bg-amber-900/50 rounded-lg">
            <p>初始化状态: {initialized ? '是' : '否'}</p>
            <p>加载状态: {loading ? '是' : '否'}</p>
            <p>用户状态: {user ? '已登录' : '未登录'}</p>
            <button
              onClick={handleForceLogout}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
            >
              强制退出并刷新
            </button>
          </div>
        )}
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

import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AuthCallbackHandler from './components/AuthCallbackHandler';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
// Pages
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';
import PopularPage from './pages/PopularPage';
import AdminPage from './pages/AdminPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SubmitPage from './pages/SubmitPage';

// Components
import Header from './components/Header';
import NotFound from './components/NotFound';

// Styles
import GlobalStyles from './styles/GlobalStyles';

// React Query Client 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: 1,
    },
  },
});

function App() {
  // 외부 인증은 해시 없는 /auth/callback으로 복귀하므로 HashRouter를 만들기 전에 처리합니다.
  if (window.location.pathname === '/auth/callback') return <AuthCallbackHandler />;
  return (
    // AuthProvider가 조회 캐시를 사용하므로 QueryClientProvider 안에 배치합니다.
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <HashRouter>
        <GlobalStyles />
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/list" element={<ListPage />} />
              <Route path="/restaurant/:id" element={<DetailPage />} />
              <Route path="/popular" element={<PopularPage />} />
              <Route path="/manage" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/submissions" element={<AdminRoute><SubmissionsPage /></AdminRoute>} />
              <Route path="/submit" element={<ProtectedRoute><SubmitPage /></ProtectedRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="footer">
            <p>© 2026 Ajou Campus Foodmap | Made with React</p>
          </footer>
        </div>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

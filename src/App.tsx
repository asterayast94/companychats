import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ChatListPage from './pages/ChatListPage';
import ChatWindowPage from './pages/ChatWindowPage';
import CreateLinkPage from './pages/CreateLinkPage';
import JoinLinkPage from './pages/JoinLinkPage';
import VideoCallLinkPage from './pages/VideoCallLinkPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <ChatListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:conversationId"
            element={
              <ProtectedRoute>
                <ChatWindowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-link/:linkId"
            element={
              <ProtectedRoute>
                <CreateLinkPage />
              </ProtectedRoute>
            }
          />
          <Route path="/join/:linkId" element={<JoinLinkPage />} />
          <Route path="/video-call/:linkId" element={<VideoCallLinkPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

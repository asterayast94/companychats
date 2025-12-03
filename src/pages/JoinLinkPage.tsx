import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';
import { apiService } from '../services/apiService';

export default function JoinLinkPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!linkId) {
      navigate('/');
      return;
    }
    (async () => {
      if (!currentUser) {
        const guestUser = {
          id: `guest-${Date.now()}`,
          name: `Guest-${Math.floor(Math.random()*1000)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest-${Date.now()}`,
        };
        login(guestUser);
      }

      // Join call on server then signaling channel
      await apiService.joinCall(linkId, currentUser?.id || `guest-${Date.now()}`);
      socketService.connect();
      socketService.joinCall(linkId, currentUser?.id || `guest-${Date.now()}`);

      setTimeout(() => {
        navigate(`/video-call/${linkId}`);
      }, 500);
    })();
  }, [linkId, currentUser, navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700 font-medium">Joining call...</p>
      </div>
    </div>
  );
}

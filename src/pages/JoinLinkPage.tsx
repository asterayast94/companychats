import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Phone, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import { users } from '../mock/mockData';

export default function JoinLinkPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linkId) {
      navigate('/');
      return;
    }

    const joinFlow = async () => {
      try {
        setIsLoading(true);

        if (!currentUser) {
          const guestUser = users[1];
          login(guestUser);
        }

        const joined = await apiService.joinCall(linkId, currentUser?.id || users[1].id);
        if (!joined) {
          setError('Failed to join call');
          return;
        }

        socketService.connect();
        socketService.joinCall(linkId, currentUser?.id || users[1].id);
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    joinFlow();
  }, [linkId, currentUser, navigate, login]);

  const handleCopyLink = () => {
    const fullLink = `${window.location.origin}/join/${linkId}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartCall = async () => {
    if (!linkId) return;

    setIsJoining(true);
    try {
      navigate(`/video-call/${linkId}`);
    } catch (err) {
      console.error('Error starting call:', err);
      setIsJoining(false);
    }
  };

  const hostUser = users[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img
              src={hostUser.avatar}
              alt={hostUser.name}
              className="w-24 h-24 rounded-full"
            />
            {hostUser.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {hostUser.name}
          </h1>
          <p className="text-gray-600 mb-1">is inviting you to a video call</p>
          <p className="text-sm text-gray-500">
            {hostUser.status === 'online' ? 'Active now' : 'Away'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <button
            onClick={handleStartCall}
            disabled={isJoining}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isJoining ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Join Video Call
              </>
            )}
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Link
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center text-xs text-gray-600">
          <p>Share this link with others to invite them to the call</p>
        </div>
      </div>
    </div>
  );
}

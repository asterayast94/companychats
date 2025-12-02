import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Phone, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { users } from '../mock/mockData';

export default function JoinLinkPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [otherUser, setOtherUser] = useState<typeof users[0] | null>(null);

  useEffect(() => {
    if (!linkId) {
      navigate('/');
      return;
    }

    const decodeLink = (id: string) => {
      try {
        const decoded = atob(id);
        const [creatorId] = decoded.split(':');
        return parseInt(creatorId);
      } catch {
        return null;
      }
    };

    const creatorId = decodeLink(linkId);
    const user = users.find(u => u.id === creatorId);

    if (user) {
      setOtherUser(user);
    } else {
      navigate('/');
    }
  }, [linkId, navigate]);

  const handleCopyLink = () => {
    const fullLink = `${window.location.origin}/join/${linkId}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartCall = () => {
    if (!currentUser) {
      const availableUser = users.find(u => u.id !== otherUser?.id);
      if (availableUser) {
        login(availableUser);
      }
    }
    setIsStarting(true);
    setTimeout(() => {
      navigate(`/video-call/${linkId}`);
    }, 500);
  };

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-24 h-24 rounded-full"
            />
            {otherUser.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {otherUser.name}
          </h1>
          <p className="text-gray-600 mb-1">wants to connect with you</p>
          <p className="text-sm text-gray-500">
            {otherUser.status === 'online' ? 'Active now' : 'Away'}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleStartCall}
            disabled={isStarting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Start Video Call
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
                Link Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Link
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-600 mb-2 font-semibold">SHARE THIS LINK</p>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded p-2">
            <input
              type="text"
              value={`${window.location.origin}/join/${linkId}`}
              readOnly
              className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="text-teal-600 hover:text-teal-700 transition"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium transition"
          >
            Go Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Share2, ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';

export default function CreateLinkPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    generateNewCall();
  }, [currentUser, navigate]);

  const generateNewCall = () => {
    const newCallId = `room-${currentUser?.id}-${Date.now()}`;
    setCallId(newCallId);
    socketService.connect();
    socketService.joinCall(newCallId, currentUser?.id || 0);
  };

  const fullLink = callId ? `${window.location.origin}/join/${callId}` : '';

  const handleCopyLink = () => {
    if (fullLink) {
      navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share && fullLink) {
      navigator.share({
        title: 'Join Video Call',
        text: 'Join me for a video call',
        url: fullLink,
      }).catch(err => console.log('Error sharing:', err));
    }
  };

  const handleStartCall = () => {
    if (callId) {
      navigate(`/video-call/${callId}`);
    }
  };

  const handleJoinCall = () => {
    if (joinRoomId.trim()) {
      navigate(`/video-call/${joinRoomId}`);
      setShowJoinDialog(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <button
          onClick={() => navigate('/chats')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="bg-teal-100 rounded-full p-4 mx-auto mb-4 w-fit">
            <Share2 className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Call</h1>
          <p className="text-gray-600 text-sm">
            Start a call or join an existing one
          </p>
        </div>

        {callId && (
          <>
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 mb-6 text-white text-center">
              <p className="text-sm font-medium mb-1">Your Room ID</p>
              <p className="text-xs font-mono break-all">{callId}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <input
                  type="text"
                  value={callId}
                  readOnly
                  className="flex-1 text-xs text-gray-900 bg-transparent focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 hover:bg-gray-200 rounded transition text-gray-600"
                  title="Copy room ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Room ID Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Room ID
                  </>
                )}
              </button>

              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="w-full border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share Link
                </button>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleStartCall}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Start Hosting Call
              </button>

              <button
                onClick={() => setShowJoinDialog(true)}
                className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Join Other Call
              </button>
            </div>
          </>
        )}
      </div>

      {showJoinDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Join a Call</h2>
            <p className="text-gray-600 text-sm mb-4">Enter the room ID to join an existing call</p>

            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="e.g., room-1-1234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowJoinDialog(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinCall}
                disabled={!joinRoomId.trim()}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium disabled:opacity-50"
              >
                Join Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

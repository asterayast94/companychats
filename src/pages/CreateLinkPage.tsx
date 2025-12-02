import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Share2, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';

export default function CreateLinkPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const initializeCall = async () => {
      try {
        setIsLoading(true);
        const newCallId = await apiService.createCall();
        if (newCallId) {
          setCallId(newCallId);
          socketService.connect();
          socketService.joinCall(newCallId, currentUser.id);
        } else {
          setError('Failed to create call');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCall();
  }, [currentUser, navigate]);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Call Ready</h1>
          <p className="text-gray-600 text-sm">
            Share this link with someone to start a video call
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 mb-6 text-white text-center">
              <p className="text-sm font-medium mb-1">Call ID: {callId?.slice(0, 8)}</p>
              <p className="text-xs opacity-90">Ready to receive calls</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <input
                  type="text"
                  value={fullLink}
                  readOnly
                  className="flex-1 text-xs text-gray-900 bg-transparent focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 hover:bg-gray-200 rounded transition text-gray-600"
                  title="Copy link"
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
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
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

            <button
              onClick={handleStartCall}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Start Call & Wait
            </button>
          </>
        )}
      </div>
    </div>
  );
}

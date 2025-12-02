import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Share2, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CreateLinkPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const fullLink = `${window.location.origin}/join/${linkId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Video Call',
        text: `Join me for a video call on ChatApp`,
        url: fullLink,
      }).catch(err => console.log('Error sharing:', err));
    }
  };

  const handleStartWaiting = () => {
    navigate(`/video-call/${linkId}`);
  };

  const generateQRCode = () => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullLink)}`;
    window.open(qrApiUrl, '_blank');
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-teal-100 rounded-full p-4 mx-auto mb-4 w-fit">
            <Share2 className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Link</h1>
          <p className="text-gray-600">
            Share this link to start a video call
          </p>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 mb-6 text-white text-center">
          <p className="text-sm font-medium mb-2">Your Link is Ready</p>
          <p className="text-xs opacity-90">Anyone with this link can join your video call</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <input
              type="text"
              value={fullLink}
              readOnly
              className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none truncate"
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
                Link Copied!
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

          <button
            onClick={generateQRCode}
            className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Generate QR Code
          </button>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleStartWaiting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Wait for Call
          </button>
          <button
            onClick={() => navigate('/chats')}
            className="w-full mt-2 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

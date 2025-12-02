import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { users } from '../mock/mockData';

export default function VideoCallLinkPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isWaiting, setIsWaiting] = useState(true);
  const [copied, setCopied] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isHost, setIsHost] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const getCreatorId = (id?: string) => {
    if (!id) return null;
    try {
      const decoded = atob(id);
      const [creatorId] = decoded.split(':');
      return parseInt(creatorId);
    } catch {
      return null;
    }
  };

  const creatorId = getCreatorId(linkId);
  const otherUser = users.find(u => u.id !== currentUser?.id);
  const isHostCreator = currentUser?.id === creatorId;

  useEffect(() => {
    setIsHost(isHostCreator);
    startCall();

    const simulateOtherUserTimer = setTimeout(() => {
      setIsWaiting(false);
      simulateRemoteStream();
    }, 3000);

    return () => {
      clearTimeout(simulateOtherUserTimer);
      stopCall();
    };
  }, []);

  useEffect(() => {
    if (!isWaiting) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isWaiting]);

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      setLocalStream(mediaStream);
      setIsConnecting(false);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Unable to access camera or microphone. Please check permissions.');
      setIsConnecting(false);
    }
  };

  const simulateRemoteStream = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      const animateCanvas = () => {
        if (ctx) {
          ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(otherUser?.name || 'Guest', canvas.width / 2, canvas.height / 2);
        }
      };

      animateCanvas();
      const canvasStream = canvas.captureStream(30);
      setRemoteStream(canvasStream);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = canvasStream;
      }
    } catch (err) {
      console.error('Error creating remote stream:', err);
    }
  };

  const stopCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    stopCall();
    navigate('/chats');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!otherUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-4">Invalid or expired link</p>
          <button
            onClick={() => navigate('/')}
            className="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-6xl max-h-screen p-4 flex flex-col">
        <div className="bg-gray-900 rounded-lg h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={otherUser.avatar}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="text-white font-semibold">{otherUser.name}</h3>
                <p className="text-gray-400 text-sm">
                  {isConnecting
                    ? 'Connecting...'
                    : isWaiting
                      ? 'Ringing...'
                      : `In call • ${formatTime(callDuration)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white text-sm">
                {isHost ? 'Host' : 'Guest'}
              </span>
              <button
                onClick={handleEndCall}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center bg-gray-800 overflow-hidden">
            {error ? (
              <div className="text-center text-white p-8">
                <VideoOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <p className="text-lg mb-2">Unable to start video call</p>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            ) : isConnecting ? (
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <p className="text-lg">Starting video call...</p>
              </div>
            ) : (
              <>
                {!isWaiting ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white w-full h-full flex items-center justify-center">
                    <div className="bg-gray-700 bg-opacity-50 rounded-lg p-8">
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 animate-pulse"
                      />
                      <p className="text-2xl font-semibold mb-2">{otherUser.name}</p>
                      <p className="text-gray-300">Waiting for response...</p>
                    </div>
                  </div>
                )}

                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute bottom-20 right-4 w-40 h-40 object-cover rounded-lg border-4 border-teal-500 shadow-lg"
                />
              </>
            )}
          </div>

          <div className="p-6 flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={toggleVideo}
              disabled={!localStream}
              className={`p-4 rounded-full transition ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleAudio}
              disabled={!localStream}
              className={`p-4 rounded-full transition ${
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            {isWaiting && (
              <button
                onClick={handleCopyLink}
                className="p-4 bg-teal-600 hover:bg-teal-700 rounded-full transition text-white"
                title="Copy link to share"
              >
                {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              </button>
            )}

            <button
              onClick={handleEndCall}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition text-white"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          {isWaiting && (
            <div className="bg-gray-800 border-t border-gray-700 p-4 text-center">
              <p className="text-gray-300 text-sm mb-2">
                Share this link to invite {otherUser.name}:
              </p>
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-600 rounded p-2 mx-auto max-w-md">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 text-xs text-gray-300 bg-transparent focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="text-teal-400 hover:text-teal-300 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

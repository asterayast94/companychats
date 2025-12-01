import { useState, useRef, useEffect } from 'react';
import { X, Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { User } from '../mock/mockData';

interface VideoCallModalProps {
  otherUser: User;
  onClose: () => void;
}

export default function VideoCallModal({ otherUser, onClose }: VideoCallModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    startCall();
    return () => {
      stopCall();
    };
  }, []);

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setStream(mediaStream);
      setIsConnecting(false);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Unable to access camera or microphone. Please check permissions.');
      setIsConnecting(false);
    }
  };

  const stopCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    stopCall();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-6xl max-h-screen p-4">
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
                  {isConnecting ? 'Connecting...' : 'In call'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center bg-gray-800">
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
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg"
                />

                <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 rounded-lg p-2">
                  <p className="text-white text-sm">Your Video</p>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white pointer-events-none">
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6">
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-24 h-24 rounded-full mx-auto mb-3"
                    />
                    <p className="text-lg font-semibold">{otherUser.name}</p>
                    <p className="text-sm text-gray-300 mt-2">Waiting to join...</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 flex items-center justify-center gap-4">
            <button
              onClick={toggleVideo}
              disabled={!stream}
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
              disabled={!stream}
              className={`p-4 rounded-full transition ${
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            <button
              onClick={handleEndCall}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition text-white"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

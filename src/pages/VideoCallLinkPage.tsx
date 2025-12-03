import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Copy, Check, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';

export default function VideoCallLinkPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  // remote stream is applied directly to the video element; no need to keep in state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([]);
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const otherUser = {
    id: 'remote',
    name: 'Participant',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(linkId || 'participant'))}`,
  };

  useEffect(() => {
    initializeCall();
    return () => {
      stopCall();
    };
  }, []);

  useEffect(() => {
    if (isCallActive) {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev: number) => prev + 1);
      }, 1000);
    }
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [isCallActive]);

  const initializeCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      setLocalStream(mediaStream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      setupPeerConnection(mediaStream);
      connectSocket();
    } catch (err) {
      console.error('Error accessing media:', err);
      setError('Camera/microphone access denied. Check permissions.');
      setIsConnecting(false);
    }
  };

  const setupPeerConnection = (mediaStream: MediaStream) => {
    const peerConfig = {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ],
    };

    const pc = new RTCPeerConnection(peerConfig);
    peerConnectionRef.current = pc;

    mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
      pc.addTrack(track, mediaStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && linkId) {
        socketService.sendIceCandidate(linkId, event.candidate, currentUser?.id || 0);
      }
    };

    pc.ontrack = (event) => {
      console.log('Remote track received');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setIsCallActive(true);
      setIsConnecting(false);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setIsCallActive(true);
        setIsConnecting(false);
      }
    };
  };

  const connectSocket = () => {
    socketService.connect();

    if (linkId) {
      socketService.joinCall(linkId, currentUser?.id || 0);
    }

    socketService.onOffer((data) => {
      handleRemoteOffer(data.offer);
    });

    socketService.onAnswer((data) => {
      handleRemoteAnswer(data.answer);
    });

    socketService.onIceCandidate((data) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socketService.onMessage((data) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const senderName = String(data.senderId) || 'Unknown';
      setMessages((prev: Array<{ sender: string; text: string; time: string }>) => [...prev, {
        sender: senderName,
        text: data.body,
        time,
      }]);
    });

    socketService.onUserJoined(() => {
      console.log('User joined, creating offer');
      setTimeout(() => {
        if (peerConnectionRef.current) {
          createAndSendOffer();
        }
      }, 500);
    });
  };

  const createAndSendOffer = async () => {
    if (!peerConnectionRef.current || !linkId) return;

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketService.sendOffer(linkId, offer, currentUser?.id || 0);
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  const handleRemoteOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current || !linkId) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socketService.sendAnswer(linkId, answer, currentUser?.id || 0);
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  };

  const handleRemoteAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  };

  const stopCall = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    if (localStream) {
      localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    socketService.disconnect();
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
    if (linkId) {
      navigator.clipboard.writeText(linkId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && linkId) {
      socketService.sendMessage(linkId, messageInput, currentUser?.id || '');
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev: Array<{ sender: string; text: string; time: string }>) => [...prev, {
        sender: currentUser?.name || 'You',
        text: messageInput,
        time,
      }]);
      setMessageInput('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="text-white font-semibold">{otherUser.name}</h3>
              <p className="text-gray-400 text-sm">
                {error
                  ? 'Error'
                  : isConnecting
                    ? 'Connecting...'
                    : isCallActive
                      ? `In call • ${formatTime(callDuration)}`
                      : 'Waiting...'}
              </p>
            </div>
          </div>
          <button
            onClick={handleEndCall}
            className="p-2 hover:bg-gray-800 rounded-lg transition text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 relative bg-gray-800 flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center text-white">
              <div className="text-6xl mb-4">!</div>
              <p className="text-lg">{error}</p>
              <button
                onClick={handleEndCall}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Close
              </button>
            </div>
          ) : isConnecting ? (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-lg">Connecting to {otherUser.name}...</p>
            </div>
          ) : (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
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

        <div className="bg-gray-900 border-t border-gray-700 p-6 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={toggleVideo}
            disabled={!localStream}
            className={`p-4 rounded-full transition ${
              isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50`}
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
            } disabled:opacity-50`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-4 bg-teal-600 hover:bg-teal-700 rounded-full transition text-white"
            title="Toggle chat"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          <button
            onClick={handleCopyLink}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition text-white"
            title="Copy room ID"
          >
            {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition text-white"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        {!isCallActive && !isConnecting && (
          <div className="bg-gray-800 border-t border-gray-700 p-3 text-center">
            <p className="text-gray-300 text-sm">
              Room ID: <span className="font-mono text-teal-400">{linkId}</span>
            </p>
          </div>
        )}
      </div>

      {showChat && (
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <h3 className="text-white font-semibold">Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No messages yet</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-semibold">{msg.sender}</span>
                    <span className="text-gray-500 text-xs">{msg.time}</span>
                  </div>
                  <p className="text-gray-300 text-sm break-words">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-700 p-3 flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 text-white text-sm rounded px-3 py-2 focus:outline-none border border-gray-700"
            />
            <button
              onClick={handleSendMessage}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition text-sm font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

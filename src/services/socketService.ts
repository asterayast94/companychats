import io, { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

let socket: Socket | null = null;

export interface WebRTCOffer {
  callId: string;
  offer: RTCSessionDescriptionInit;
  sender: string;
}

export interface WebRTCAnswer {
  callId: string;
  answer: RTCSessionDescriptionInit;
  sender: string;
}

export interface WebRTCIceCandidate {
  callId: string;
  candidate: RTCIceCandidateInit;
  sender: string;
}

export interface ChatMessage {
  chatId: number;
  senderId: string;
  body: string;
  timestamp: string;
}

export const socketService = {
  connect(): Socket {
    if (socket && socket.connected) {
      return socket;
    }

    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  },

  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket(): Socket | null {
    return socket;
  },

  joinCall(callId: string, user: string | number): void {
    if (socket) {
      socket.emit('joinCall', { callId, user: String(user) });
    }
  },

  sendOffer(callId: string, offer: RTCSessionDescriptionInit, sender: string | number): void {
    if (socket) {
      socket.emit('webrtc-offer', { callId, offer, sender: String(sender) });
    }
  },

  sendAnswer(callId: string, answer: RTCSessionDescriptionInit, sender: string | number): void {
    if (socket) {
      socket.emit('webrtc-answer', { callId, answer, sender: String(sender) });
    }
  },

  sendIceCandidate(callId: string, candidate: RTCIceCandidateInit, sender: string | number): void {
    if (socket) {
      socket.emit('webrtc-ice', { callId, candidate, sender: String(sender) });
    }
  },

  joinChat(chatId: number): void {
    if (socket) {
      socket.emit('joinChat', { chatId });
    }
  },

  sendMessage(chatId: string | number, message: string, senderId: string | number): void {
    if (socket) {
      socket.emit('sendMessage', {
        chatId,
        senderId,
        message,
        body: message,
        timestamp: new Date().toISOString(),
      });
    }
  },

  onOffer(callback: (data: WebRTCOffer) => void): void {
    if (socket) {
      socket.on('webrtc-offer', callback);
    }
  },

  onAnswer(callback: (data: WebRTCAnswer) => void): void {
    if (socket) {
      socket.on('webrtc-answer', callback);
    }
  },

  onIceCandidate(callback: (data: WebRTCIceCandidate) => void): void {
    if (socket) {
      socket.on('webrtc-ice', callback);
    }
  },

  onMessage(callback: (data: ChatMessage) => void): void {
    if (socket) {
      // Server emits 'messageReceived' with shape: { chatId, message }
      socket.on('messageReceived', (payload: any) => {
        try {
          const chatId = payload.chatId ?? payload.chat?.id ?? null;
          const msg = payload.message || payload;
          const normalized: ChatMessage = {
            chatId: Number(chatId),
            senderId: String(msg.from ?? msg.senderId ?? ''),
            body: msg.text || msg.body || msg.message || '',
            timestamp: msg.time ? new Date(msg.time).toISOString() : (msg.timestamp || new Date().toISOString()),
          };

          callback(normalized);
        } catch (err) {
          console.error('Error normalizing incoming message', err, payload);
        }
      });
    }
  },

  onUserJoined(callback: (data: { callId: string; user: string }) => void): void {
    if (socket) {
      socket.on('userJoined', callback);
    }
  },

  onUserLeft(callback: (data: { callId: string; user: string }) => void): void {
    if (socket) {
      socket.on('userLeft', callback);
    }
  },

  offOffer(): void {
    if (socket) {
      socket.off('webrtc-offer');
    }
  },

  offAnswer(): void {
    if (socket) {
      socket.off('webrtc-answer');
    }
  },

  offIceCandidate(): void {
    if (socket) {
      socket.off('webrtc-ice');
    }
  },

  offMessage(): void {
    if (socket) {
      socket.off('messageReceived');
    }
  },

  offUserJoined(): void {
    if (socket) {
      socket.off('userJoined');
    }
  },

  offUserLeft(): void {
    if (socket) {
      socket.off('userLeft');
    }
  },
};

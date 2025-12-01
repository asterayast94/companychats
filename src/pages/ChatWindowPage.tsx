import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Video, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { conversations, users, messages as initialMessages, Message } from '../mock/mockData';
import MessageBubble from '../components/MessageBubble';
import VideoCallModal from '../components/VideoCallModal';

export default function ChatWindowPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const conversation = useMemo(() => {
    return conversations.find(c => c.id === Number(conversationId));
  }, [conversationId]);

  const otherUser = useMemo(() => {
    if (!conversation || !currentUser) return null;
    const otherUserId = conversation.participants.find(id => id !== currentUser.id);
    return users.find(u => u.id === otherUserId);
  }, [conversation, currentUser]);

  const conversationMessages = useMemo(() => {
    return messages.filter(m => m.conversationId === Number(conversationId));
  }, [messages, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setIsTyping(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !conversation) return;

    const message: Message = {
      id: Date.now(),
      conversationId: conversation.id,
      senderId: currentUser.id,
      type: 'text',
      body: newMessage.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    setTimeout(() => {
      setIsTyping(true);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !conversation) return;

    const isImage = file.type.startsWith('image/');
    const message: Message = {
      id: Date.now(),
      conversationId: conversation.id,
      senderId: currentUser.id,
      type: isImage ? 'image' : 'file',
      body: `File uploaded: ${file.name}`,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
  };

  if (!currentUser || !conversation || !otherUser) {
    navigate('/chats');
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-gray-100 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chats')}
              className="p-2 hover:bg-gray-200 rounded-lg transition lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
              <p className="text-xs text-gray-600">
                {otherUser.status === 'online' ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVideoCallOpen(true)}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              title="Start video call"
            >
              <Video className="w-5 h-5 text-teal-600" />
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-lg transition">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {conversationMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUser.id}
            senderName={message.senderId !== currentUser.id ? otherUser.name : undefined}
          />
        ))}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {isVideoCallOpen && (
        <VideoCallModal
          otherUser={otherUser}
          onClose={() => setIsVideoCallOpen(false)}
        />
      )}
    </div>
  );
}

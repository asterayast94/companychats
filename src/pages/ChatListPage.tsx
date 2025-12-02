import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Link2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { conversations, users, messages } from '../mock/mockData';
import ChatListItem from '../components/ChatListItem';

export default function ChatListPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const userConversations = useMemo(() => {
    if (!currentUser) return [];

    return conversations
      .filter(conv => conv.participants.includes(currentUser.id))
      .map(conv => {
        const otherUserId = conv.participants.find(id => id !== currentUser.id);
        const otherUser = users.find(u => u.id === otherUserId);
        const convMessages = messages.filter(m => m.conversationId === conv.id);
        const lastMessage = convMessages[convMessages.length - 1];

        return {
          conversation: conv,
          otherUser,
          lastMessage
        };
      })
      .filter(item => item.otherUser)
      .sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [currentUser]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return userConversations;

    return userConversations.filter(item =>
      item.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userConversations, searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChatClick = (conversationId: number) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleCreateLink = () => {
    const linkId = btoa(`${currentUser.id}:${Date.now()}`);
    navigate(`/create-link/${linkId}`);
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-teal-700 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold">{currentUser.name}</h2>
              <p className="text-xs text-teal-100">Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateLink}
              className="p-2 hover:bg-teal-600 rounded-lg transition"
              title="Create video call link"
            >
              <Link2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-teal-600 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-teal-600 text-white placeholder-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map(({ conversation, otherUser, lastMessage }) => (
              otherUser && (
                <ChatListItem
                  key={conversation.id}
                  conversation={conversation}
                  otherUser={otherUser}
                  lastMessage={lastMessage}
                  isActive={false}
                  onClick={() => handleChatClick(conversation.id)}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

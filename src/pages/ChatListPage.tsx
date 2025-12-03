import { useState, useMemo, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Link2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService, ChatResponse } from '../services/apiService';
import ChatListItem from '../components/ChatListItem';

export default function ChatListPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatResponse[]>([]);

  interface ChatItem {
    conversation: { id: number; type: string; participants: string[]; unreadCount?: number };
    otherUser: { id: string; name: string; avatar?: string };
    lastMessage?: { body: string; time?: number } | null;
  }

  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      const data = await apiService.getChatsForUser(String(currentUser.id));
      setChats(data);
    })();
  }, [currentUser]);

  const userConversations = useMemo(() => {
    if (!currentUser) return [];

    return chats
      .filter((conv: ChatResponse) => Array.isArray(conv.users) && conv.users.includes(String(currentUser.id)))
      .map((conv: ChatResponse) => {
        const otherUserId = conv.users.find((id: string) => id !== String(currentUser.id)) || 'unknown';
        const otherUser = {
          id: otherUserId,
          name: otherUserId,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(otherUserId)}`,
        };

        const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;

        return {
          conversation: { id: conv.id, type: 'private', participants: conv.users as any },
          otherUser,
          lastMessage
        };
      })
      .sort((a: ChatItem, b: ChatItem) => {
        const aTime = a.lastMessage ? (a.lastMessage.time || 0) : 0;
        const bTime = b.lastMessage ? (b.lastMessage.time || 0) : 0;
        return bTime - aTime;
      });
  }, [currentUser, chats]);

  const filteredConversations = useMemo<ChatItem[]>(() => {
    if (!searchQuery.trim()) return userConversations;

    return userConversations.filter((item: ChatItem) =>
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

  const handleNewChat = async () => {
    const other = window.prompt('Enter user id to start chat with (e.g. u2)');
    if (!other || !currentUser) return;

    const created = await apiService.createChat([String(currentUser.id), String(other)]);
    if (created) {
      // Refresh chat list
      const data = await apiService.getChatsForUser(String(currentUser.id));
      setChats(data);
      // Navigate to created chat
      navigate(`/chat/${created.id}`);
    } else {
      alert('Failed to create chat');
    }
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
              onClick={handleNewChat}
              className="p-2 hover:bg-teal-600 rounded-lg transition"
              title="Start new chat"
            >
              <Plus className="w-5 h-5" />
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
            onChange={(e: any) => setSearchQuery(e.target.value)}
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
              {filteredConversations.map((item: ChatItem) => {
                const { conversation, otherUser, lastMessage } = item;
                return otherUser ? (
                  <ChatListItem
                    key={conversation.id}
                    conversation={conversation}
                    otherUser={otherUser}
                    lastMessage={lastMessage}
                    isActive={false}
                    onClick={() => handleChatClick(conversation.id)}
                  />
                ) : null;
              })}
          </div>
        )}
      </div>
    </div>
  );
}

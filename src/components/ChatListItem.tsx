import { User, Conversation, Message } from '../mock/mockData';
import { formatDistanceToNow } from '../utils/dateUtils';

interface ChatListItemProps {
  conversation: Conversation;
  otherUser: User;
  lastMessage: Message | undefined;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatListItem({
  conversation,
  otherUser,
  lastMessage,
  isActive,
  onClick
}: ChatListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition ${
        isActive ? 'bg-gray-100' : ''
      }`}
    >
      <div className="relative">
        <img
          src={otherUser.avatar}
          alt={otherUser.name}
          className="w-12 h-12 rounded-full"
        />
        {otherUser.status === 'online' && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{otherUser.name}</h3>
          {lastMessage && (
            <span className="text-xs text-gray-500 ml-2">
              {formatDistanceToNow(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">
          {lastMessage?.body || 'No messages yet'}
        </p>
      </div>

      {conversation.unreadCount && conversation.unreadCount > 0 && (
        <div className="bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {conversation.unreadCount}
        </div>
      )}
    </div>
  );
}

import { formatMessageTime } from '../utils/dateUtils';
import { FileText, Image as ImageIcon } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id?: number;
    conversationId?: number;
    senderId: string;
    type: 'text' | 'file' | 'image';
    body: string;
    fileName?: string;
    fileUrl?: string;
    createdAt?: string;
  };
  isOwn: boolean;
  senderName?: string;
}

export default function MessageBubble({ message, isOwn, senderName }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && senderName && (
          <p className="text-xs text-gray-600 mb-1 ml-2">{senderName}</p>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-teal-600 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {message.type === 'text' && (
            <p className="break-words">{message.body}</p>
          )}

          {message.type === 'file' && (
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <div>
                <p className="font-medium">{message.fileName}</p>
                <p className="text-xs opacity-75">{message.body}</p>
              </div>
            </div>
          )}

          {message.type === 'image' && (
            <div>
              <div className="mb-2">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-sm">{message.fileName}</p>
              {message.body && <p className="text-xs mt-1 opacity-75">{message.body}</p>}
            </div>
          )}

          <p className={`text-xs mt-1 ${isOwn ? 'text-teal-100' : 'text-gray-600'}`}>
            {formatMessageTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface User {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  type: 'text' | 'file' | 'image';
  body: string;
  fileName?: string;
  fileUrl?: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  type: 'private' | 'group';
  participants: number[];
  name?: string;
  unreadCount?: number;
}

export const users: User[] = [
  { id: 1, name: 'Alice Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', status: 'online' },
  { id: 2, name: 'Bob Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', status: 'online' },
  { id: 3, name: 'Carol Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol', status: 'away' },
  { id: 4, name: 'David Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', status: 'offline' },
  { id: 5, name: 'Emma Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', status: 'online' },
];

export const conversations: Conversation[] = [
  { id: 100, type: 'private', participants: [1, 2], unreadCount: 2 },
  { id: 101, type: 'private', participants: [1, 3], unreadCount: 0 },
  { id: 102, type: 'private', participants: [1, 4], unreadCount: 1 },
  { id: 103, type: 'private', participants: [1, 5], unreadCount: 0 },
];

export const messages: Message[] = [
  { id: 1, conversationId: 100, senderId: 2, type: 'text', body: 'Hey Alice! How are you?', createdAt: '2025-12-01T08:30:00Z' },
  { id: 2, conversationId: 100, senderId: 1, type: 'text', body: 'Hi Bob! I\'m doing great, thanks for asking!', createdAt: '2025-12-01T08:32:00Z' },
  { id: 3, conversationId: 100, senderId: 2, type: 'text', body: 'That\'s awesome! Are we still on for the meeting tomorrow?', createdAt: '2025-12-01T08:33:00Z' },
  { id: 4, conversationId: 100, senderId: 1, type: 'text', body: 'Yes, absolutely! 2 PM works perfectly for me.', createdAt: '2025-12-01T08:35:00Z' },
  { id: 5, conversationId: 100, senderId: 2, type: 'text', body: 'Perfect! I\'ll send you the agenda shortly.', createdAt: '2025-12-01T09:45:00Z' },

  { id: 6, conversationId: 101, senderId: 3, type: 'text', body: 'Alice, did you see the new design mockups?', createdAt: '2025-11-30T14:20:00Z' },
  { id: 7, conversationId: 101, senderId: 1, type: 'text', body: 'Yes! They look fantastic. Great work!', createdAt: '2025-11-30T14:25:00Z' },
  { id: 8, conversationId: 101, senderId: 3, type: 'text', body: 'Thanks! Let me know if you need any revisions.', createdAt: '2025-11-30T14:30:00Z' },

  { id: 9, conversationId: 102, senderId: 4, type: 'text', body: 'Hi Alice, can you review the latest PR?', createdAt: '2025-11-29T16:00:00Z' },
  { id: 10, conversationId: 102, senderId: 1, type: 'text', body: 'Sure, I\'ll take a look this afternoon.', createdAt: '2025-11-29T16:15:00Z' },

  { id: 11, conversationId: 103, senderId: 5, type: 'text', body: 'Good morning Alice!', createdAt: '2025-11-28T09:00:00Z' },
  { id: 12, conversationId: 103, senderId: 1, type: 'text', body: 'Good morning Emma! How\'s the project going?', createdAt: '2025-11-28T09:10:00Z' },
  { id: 13, conversationId: 103, senderId: 5, type: 'text', body: 'Really well! We\'re ahead of schedule.', createdAt: '2025-11-28T09:15:00Z' },
];

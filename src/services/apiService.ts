const API_BASE_URL = 'http://localhost:4000/compchat/api';

export interface ChatResponse {
  id: number;
  type: 'private' | 'group';
  participants: number[];
}

export interface MessageResponse {
  id: number;
  chatId: number;
  senderId: number;
  body: string;
  createdAt?: string;
}

export interface CallResponse {
  success: boolean;
  callId: string;
}

export const apiService = {
  async getChatsForUser(userId: number): Promise<ChatResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chats?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch chats');
      return response.json();
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  async getMessages(chatId: number): Promise<MessageResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages?chatId=${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async createCall(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create call');
      const data: CallResponse = await response.json();
      return data.callId;
    } catch (error) {
      console.error('Error creating call:', error);
      return null;
    }
  },

  async joinCall(callId: string, user: string | number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, user: String(user) }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error joining call:', error);
      return false;
    }
  },

  async createChat(users: (string | number)[]): Promise<ChatResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: users.map(u => String(u)) }),
      });
      if (!response.ok) throw new Error('Failed to create chat');
      return response.json();
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  },
};

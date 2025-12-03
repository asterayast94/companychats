const API_BASE_URL = 'http://localhost:4000/compchat/api';

export interface ChatResponse {
  id: number;
  users: string[];
  messages?: Array<{ from: string; text: string; time: number }>;
}

export interface MessageResponse {
  from: string;
  text: string;
  time: number;
}

export interface CallCreateResponse {
  success: boolean;
  call: { callId: string } | null;
}

export const apiService = {
  async getChatsForUser(userId: string): Promise<ChatResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${encodeURIComponent(String(userId))}`);
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();
      return data.chats || [];
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  async getMessages(chatId: number): Promise<MessageResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/messages/${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(chatId: number, from: string, text: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, from, text }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  async createCall(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create call');
      const data: CallCreateResponse = await response.json();
      return data.call?.callId || null;
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
      if (!response.ok) return false;
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Error joining call:', error);
      return false;
    }
  },

  async createChat(users: (string | number)[]) {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: users.map(u => String(u)) }),
      });
      if (!response.ok) throw new Error('Failed to create chat');
      const data = await response.json();
      return data.chat || null;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  },
};

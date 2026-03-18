export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface ChatSession {
  conversationId: string;
  corpUin: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface WPAResponse {
  output: string;
  robot_history?: Message[];
}

export interface CozeWPAConfig {
  conversationId: string;
  corpUin: string;
  robotHistory: Message[];
  wpa: string;
}

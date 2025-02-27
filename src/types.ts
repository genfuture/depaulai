export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}
export type ToolType = 'RAG' | 'DB' | 'Direct';

export interface ChatSource {
  id: string;
  title: string;
  preview: string;
  distance: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  tool?: ToolType;
  sources?: ChatSource[];
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
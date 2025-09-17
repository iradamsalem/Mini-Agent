import { Card } from '@/components/ui/card';
import { ChatMessage } from '@/types/chat';
import ToolBadge from './ToolBadge';
import SourcesList from './SourcesList';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: ChatMessage;
  query?: string;
}

export default function MessageBubble({ message, query }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex w-full gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="shrink-0 mt-1">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
        <Card className={`p-4 shadow-soft ${
          isUser 
            ? 'bg-gradient-primary text-white border-transparent ml-auto' 
            : 'bg-chat-surface border-chat-border'
        }`}>
          {!isUser && message.tool && (
            <div className="mb-3">
              <ToolBadge tool={message.tool} />
            </div>
          )}
          
          <div className={`prose prose-sm max-w-none ${
            isUser 
              ? 'prose-invert' 
              : 'prose-neutral prose-headings:text-text-primary prose-p:text-text-primary prose-strong:text-text-primary prose-li:text-text-primary prose-ul:text-text-primary prose-ol:text-text-primary prose-code:text-text-primary'
          }`}>
            {isUser ? (
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            ) : (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 last:mb-0 list-disc list-inside space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 last:mb-0 list-decimal list-inside space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-text-primary">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                  code: ({ children }) => <code className="bg-chat-border px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          
          {!isUser && message.sources && message.sources.length > 0 && (
            <SourcesList sources={message.sources} query={query} />
          )}
        </Card>
        
        <div className="mt-1 text-xs text-text-muted px-1">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {isUser && (
        <div className="shrink-0 mt-1 order-2">
          <div className="h-8 w-8 rounded-full bg-chat-surface border border-chat-border flex items-center justify-center">
            <User className="h-4 w-4 text-text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
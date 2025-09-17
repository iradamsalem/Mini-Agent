import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Square } from 'lucide-react';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onStopGeneration?: () => void;
}

export default function InputBar({ 
  onSendMessage, 
  isLoading = false, 
  onStopGeneration 
}: InputBarProps) {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    
    onSendMessage(message.trim());
    setMessage('');
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleStop = () => {
    onStopGeneration?.();
  };
  
  return (
    <div className="sticky bottom-0 z-40 border-t border-chat-border bg-chat-surface/80 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl p-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="min-h-[60px] max-h-32 resize-none bg-chat-surface-hover border-chat-border focus:border-primary/50 focus:ring-primary/20"
              disabled={isLoading}
            />
          </div>
          
          <Button
            onClick={isLoading ? handleStop : handleSend}
            disabled={!message.trim() && !isLoading}
            size="lg"
            className={`h-[60px] px-6 ${
              isLoading 
                ? 'bg-error hover:bg-error/90 text-white' 
                : 'bg-gradient-primary hover:opacity-90 text-white border-0'
            }`}
          >
            {isLoading ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-text-muted text-center">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}
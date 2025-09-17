import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { ChatSource } from '@/types/chat';

interface SourcesListProps {
  sources: ChatSource[];
  query?: string;
}

export default function SourcesList({ sources, query = '' }: SourcesListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const highlightQuery = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-tool-rag/20 text-tool-rag">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  
  return (
    <div className="mt-4 space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-0 text-text-secondary hover:text-text-primary"
      >
        <span className="text-sm font-medium">
          Sources ({sources.length})
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          {sources.map((source) => (
            <Card key={source.id} className="p-4 bg-chat-surface border-chat-border hover:bg-chat-surface-hover transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-text-primary truncate">
                      {highlightQuery(source.title, query)}
                    </h4>
                    <div className="text-xs text-text-muted bg-chat-border px-2 py-0.5 rounded-full">
                      {Math.round(source.distance * 100)}% match
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                    {highlightQuery(source.preview, query)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-8 w-8 p-0 text-text-muted hover:text-text-primary"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
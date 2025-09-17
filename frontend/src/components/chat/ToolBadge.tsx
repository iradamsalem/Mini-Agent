import { Badge } from '@/components/ui/badge';
import { Search, Database, Zap } from 'lucide-react';
import { ToolType } from '@/types/chat';

interface ToolBadgeProps {
  tool: ToolType;
}

const toolConfig = {
  RAG: {
    icon: Search,
    label: 'RAG',
    color: 'bg-tool-rag/10 text-tool-rag border-tool-rag/20'
  },
  DB: {
    icon: Database,
    label: 'Database',
    color: 'bg-tool-db/10 text-tool-db border-tool-db/20'
  },
  Direct: {
    icon: Zap,
    label: 'Direct',
    color: 'bg-tool-direct/10 text-tool-direct border-tool-direct/20'
  }
};

export default function ToolBadge({ tool }: ToolBadgeProps) {
  const config = toolConfig[tool];
  const Icon = config.icon;
  
  return (
    <Badge className={`flex items-center gap-1.5 ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
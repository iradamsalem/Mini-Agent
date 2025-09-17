import { Badge } from '@/components/ui/badge';
import { MessageSquare, Wifi, WifiOff } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
interface ChatHeaderProps {
  isOnline?: boolean;
}
export default function ChatHeader({
  isOnline = true
}: ChatHeaderProps) {
  return <header className="sticky top-0 z-50 border-b border-chat-border bg-chat-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-primary p-2">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Mini Agent</h1>
            <p className="text-sm text-text-secondary">Powered by AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Badge variant={isOnline ? "secondary" : "destructive"} className={`flex items-center gap-2 ${isOnline ? 'bg-status-online/10 text-status-online border-status-online/20' : 'bg-error/10 text-error border-error/20'}`}>
            {isOnline ? <>
                <Wifi className="h-3 w-3" />
                Online
              </> : <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>}
          </Badge>
        </div>
      </div>
    </header>;
}
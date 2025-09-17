export default function LoadingDots() {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        <div className="h-2 w-2 rounded-full bg-text-muted animate-pulse"></div>
        <div className="h-2 w-2 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="h-2 w-2 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="text-sm text-text-muted ml-2">Thinking...</span>
    </div>
  );
}
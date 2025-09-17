import { useState, useRef, useEffect } from 'react'
import { ChatMessage, ChatState } from '@/types/chat'
import { sendMessage, getHealth } from '@/services/api'
import ChatHeader from '@/components/chat/ChatHeader'
import MessageBubble from '@/components/chat/MessageBubble'
import InputBar from '@/components/chat/InputBar'
import LoadingDots from '@/components/chat/LoadingDots'
import ErrorBanner from '@/components/chat/ErrorBanner'

export default function Index() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  })
  const [currentQuery, setCurrentQuery] = useState('')
  const [online, setOnline] = useState<boolean>(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Health for header chip
  useEffect(() => {
    getHealth().then(setOnline).catch(() => setOnline(false))
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatState.messages, chatState.isLoading])

  const handleSendMessage = async (message: string) => {
    setCurrentQuery(message)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    }
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }))

    try {
      // Send to API and get response
      const assistantMessage = await sendMessage(message)
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }))
    } catch (error) {
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to send message. Please try again.',
      }))
    }
  }

  const handleStopGeneration = () => {
    setChatState((prev) => ({ ...prev, isLoading: false }))
  }

  const handleDismissError = () => {
    setChatState((prev) => ({ ...prev, error: null }))
  }

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary">
      <ChatHeader isOnline={online} />

      <main className="mx-auto max-w-4xl px-6 pb-32">
        {/* Empty state */}
        {chatState.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="mb-8 h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-4">Welcome to Mini Agent</h2>
            <p className="text-lg text-text-secondary max-w-md">
              I can help you with research, data analysis, and questions.
              Ask me anything to get started!
            </p>
          </div>
        )}

        {/* Error banner */}
        {chatState.error && (
          <div className="mb-6">
            <ErrorBanner error={chatState.error} onDismiss={handleDismissError} />
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6 py-6">
          {chatState.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              query={message.type === 'assistant' ? currentQuery : undefined}
            />
          ))}

          {/* Loading indicator */}
          {chatState.isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-white text-sm">🤖</span>
                    </div>
                  </div>
                  <div className="bg-chat-surface border border-chat-border rounded-lg p-4 shadow-soft">
                    <LoadingDots />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </main>

      <InputBar
        onSendMessage={handleSendMessage}
        isLoading={chatState.isLoading}
        onStopGeneration={handleStopGeneration}
      />
    </div>
  )
}

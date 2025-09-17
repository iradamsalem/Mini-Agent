// src/services/api.ts
import { ask, health } from '../lib/api'
import type { ChatMessage, ChatSource, ToolType } from '@/types/chat'

// backend: 'rag' | 'db' | 'direct'  →  UI: 'RAG' | 'DB' | 'Direct'
const TOOL_MAP: Record<'rag' | 'db' | 'direct', ToolType> = {
  rag: 'RAG',
  db: 'DB',
  direct: 'Direct',
}

/** Sends the user's query and returns a normalized assistant message for the UI */
export async function sendMessage(query: string): Promise<ChatMessage> {
  const res = await ask(query)
  const tool: ToolType = TOOL_MAP[res.tool]

  let sources: ChatSource[] | undefined
  if (res.tool === 'rag') {
    // Convert distance (lower=better) → similarity (higher=better) for "% match" UI
    sources = res.sources.map((s): ChatSource => ({
      id: String(s.id),                        // 👈 fix: number → string
      title: s.title ?? `Doc #${s.id}`,
      preview: (s.text ?? '').slice(0, 280),
      distance: Math.max(0, Math.min(1, 1 - Number(s.distance))), // keep 0..1
      // אם ב-ChatSource אין שדה כזה זה פשוט יתעלם (לא חובה):
      // @ts-expect-error optional in your UI types
      chunkIndex: s.chunkIndex,
    }))
  }

  const assistant: ChatMessage = {
    id: Date.now().toString(),
    type: 'assistant',
    content: res.answer,
    timestamp: new Date(),
    tool,
    ...(sources ? { sources } : {}),
  }

  return assistant
}

/** Health proxy for header indicator */
export async function getHealth(): Promise<boolean> {
  return health()
}

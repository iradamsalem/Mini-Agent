// src/lib/api.ts
export type RagSource = {
    id: number
    title: string
    chunkIndex: number
    text: string
    distance: number
  }
  
  export type AskResponse =
    | { tool: 'rag'; answer: string; sources: RagSource[] }
    | { tool: 'db' | 'direct'; answer: string }
  
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || ''
  
  /**
   * Sends a question to the backend and returns the answer.
   * Normalizes edge cases so the UI never breaks.
   */
  export async function ask(query: string): Promise<AskResponse> {
    if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set')
  
    const res = await fetch(`${API_BASE_URL}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
  
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText)
      throw new Error(`API ${res.status}: ${txt}`)
    }
  
    const data = await res.json()
  
    // Fallback if tool missing/unknown ⇒ treat as direct
    if (!data.tool || !['rag', 'db', 'direct'].includes(data.tool)) {
      console.warn('[api.ts] Unexpected response tool:', data.tool)
      return { tool: 'direct', answer: data.answer ?? '[no answer]' }
    }
  
    // Ensure sources array when tool=rag
    if (data.tool === 'rag' && !Array.isArray(data.sources)) {
      console.warn('[api.ts] RAG response missing sources, using empty list')
      data.sources = []
    }
  
    return data
  }
  
  /** Health check for header indicator */
  export async function health(): Promise<boolean> {
    if (!API_BASE_URL) return false
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' })
      if (!res.ok) return false
      const data = await res.json()
      return Boolean(data.ok)
    } catch {
      return false
    }
  }
  
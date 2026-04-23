import { useState, useCallback } from 'react'
import { api } from '../lib/api'

export function useChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(false)

  const sendMessage = useCallback(async (question, selectedDocIds) => {
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: question, ts: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const result = await api.query(question, selectedDocIds)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'assistant',
        content: result.answer, sources: result.sources,
        model: result.model_used, ts: new Date(),
      }])
    } catch (e) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'error', content: e.message, ts: new Date() }])
    } finally { setLoading(false) }
  }, [])

  const clearChat = useCallback(() => setMessages([]), [])

  return { messages, loading, sendMessage, clearChat }
}

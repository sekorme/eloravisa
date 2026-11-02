"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, Send, ThumbsUp, X } from 'lucide-react'
import { toast } from 'sonner'
import { fetchQuestions, postQuestion, type SessionQuestion } from '@/lib/liveSessions'

const POLL_MS = 5000

/** Ask the host questions during a paid session; upvote others' questions. */
export default function SessionQA({ meetingId, onClose }: { meetingId: string; onClose: () => void }) {
  const [questions, setQuestions] = useState<SessionQuestion[] | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setQuestions(await fetchQuestions(meetingId))
    } catch {
      // Transient; the next poll retries.
    }
  }, [meetingId])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, POLL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  const ask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      setQuestions(await postQuestion(meetingId, { text }))
      setText('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send your question")
    } finally {
      setSending(false)
    }
  }

  const vote = async (q: SessionQuestion) => {
    try {
      setQuestions(await postQuestion(meetingId, { questionId: q.id, upvote: !q.upvotedByMe }))
    } catch {
      toast.error("Couldn't record your vote")
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#19232d] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="font-semibold">Questions for the host</h2>
        <button onClick={onClose} aria-label="Close questions" className="rounded p-1 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {!questions ? (
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        ) : questions.length === 0 ? (
          <p className="text-center text-sm text-white/60">No questions yet. Ask the first one below.</p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className={`rounded-lg bg-white/5 p-3 ${q.answered ? 'opacity-60' : ''}`}>
              <p className="text-sm">{q.text}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                <span className="flex items-center gap-1.5">
                  {q.mine ? 'You' : q.name}
                  {q.answered && <span className="flex items-center gap-0.5 text-emerald-400"><Check className="h-3 w-3" /> Answered</span>}
                </span>
                <button
                  onClick={() => vote(q)}
                  disabled={q.mine}
                  aria-pressed={q.upvotedByMe}
                  aria-label={q.upvotedByMe ? 'Remove upvote' : 'Upvote'}
                  className={`flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10 disabled:hover:bg-transparent ${q.upvotedByMe ? 'text-sky-400' : ''}`}
                >
                  <ThumbsUp className="h-3 w-3" /> {q.upvotes}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={ask} className="flex gap-2 border-t border-white/10 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="Ask a question…"
          aria-label="Your question"
          className="h-10 min-w-0 flex-1 rounded-full bg-white/10 px-4 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button type="submit" disabled={sending || !text.trim()} aria-label="Send question" className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 disabled:opacity-50">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  )
}

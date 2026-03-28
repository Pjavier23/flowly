'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { TOPICS } from '@/lib/topics'

interface Props {
  user: User
  onComplete: (topics: string[]) => void
}

export default function OnboardingPage({ user, onComplete }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelected(next)
  }

  const handleContinue = async () => {
    if (selected.size < 3) {
      setError('Please pick at least 3 topics')
      return
    }
    setSaving(true)
    setError('')

    const topics = Array.from(selected)
    const { error } = await supabase.from('flowly_preferences').upsert({
      user_id: user.id,
      topics,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    onComplete(topics)
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4 py-12">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-3xl font-bold mb-2">What&apos;s your vibe?</h1>
          <p className="text-white/40 text-sm">
            Pick at least <span className="text-white font-semibold">3 topics</span> you care about. We&apos;ll build your perfect feed.
          </p>
        </div>

        {/* Bubbles grid */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {TOPICS.map((topic, index) => {
            const isSelected = selected.has(topic.id)
            const delay = (index % 8) * 0.3
            return (
              <button
                key={topic.id}
                onClick={() => toggle(topic.id)}
                style={{ animationDelay: `${delay}s` }}
                className={`
                  bubble relative group cursor-pointer select-none
                  flex flex-col items-center justify-center gap-1
                  w-[100px] h-[100px] rounded-full
                  transition-all duration-300 ease-out
                  ${isSelected
                    ? `bg-gradient-to-br ${topic.gradient} scale-110 bubble-selected shadow-2xl`
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105'
                  }
                `}
              >
                <span className={`text-2xl transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {topic.emoji}
                </span>
                <span className={`text-xs font-semibold text-center leading-tight px-1 ${isSelected ? 'text-white' : 'text-white/60'}`}>
                  {topic.label}
                </span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected count */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${selected.size >= 3 ? 'bg-green-400' : 'bg-white/20'}`} />
            <span className="text-sm text-white/60">
              {selected.size === 0
                ? 'No topics selected'
                : selected.size < 3
                ? `${selected.size} selected — pick ${3 - selected.size} more`
                : `${selected.size} topics selected 🎉`
              }
            </span>
          </div>
        </div>

        {error && (
          <div className="text-center mb-4 text-red-400 text-sm">{error}</div>
        )}

        {/* CTA */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={selected.size < 3 || saving}
            className={`
              px-10 py-4 rounded-2xl text-base font-bold transition-all duration-300
              ${selected.size >= 3
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 hover:scale-105 shadow-2xl shadow-purple-500/30'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
              }
            `}
          >
            {saving ? 'Building your feed...' : 'Start My Feed →'}
          </button>
        </div>
      </div>
    </div>
  )
}

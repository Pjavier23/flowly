'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import LoginPage from '@/components/LoginPage'
import OnboardingPage from '@/components/OnboardingPage'
import FeedPage from '@/components/FeedPage'

type AppState = 'loading' | 'auth' | 'onboarding' | 'feed'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [topics, setTopics] = useState<string[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setAppState('auth')
        return
      }
      setUser(session.user)
      await checkPreferences(session.user.id)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        setAppState('auth')
      } else if (event === 'SIGNED_IN' && session.user) {
        setUser(session.user)
        await checkPreferences(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkPreferences = async (userId: string) => {
    const { data } = await supabase
      .from('flowly_preferences')
      .select('topics')
      .eq('user_id', userId)
      .single()

    if (data && data.topics && data.topics.length >= 3) {
      setTopics(data.topics)
      setAppState('feed')
    } else {
      setAppState('onboarding')
    }
  }

  const handleOnboardingComplete = (selectedTopics: string[]) => {
    setTopics(selectedTopics)
    setAppState('feed')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🌊</div>
          <p className="text-white/40 text-sm">Loading Flowly...</p>
        </div>
      </div>
    )
  }

  if (appState === 'auth') {
    return <LoginPage onLogin={() => {}} />
  }

  if (appState === 'onboarding' && user) {
    return <OnboardingPage user={user} onComplete={handleOnboardingComplete} />
  }

  if (appState === 'feed' && user) {
    return <FeedPage user={user} topics={topics} onLogout={handleLogout} />
  }

  return null
}

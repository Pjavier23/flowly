'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { TOPICS, getTopicById } from '@/lib/topics'
import { Article } from '@/lib/types'
import ArticleCard from './ArticleCard'
import BottomNav from './BottomNav'
import SavedPage from './SavedPage'
import { supabase } from '@/lib/supabase'

interface Props {
  user: User
  topics: string[]
  onLogout: () => void
}

type Tab = 'feed' | 'explore' | 'trending' | 'saved' | 'profile'

export default function FeedPage({ user, topics, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [activeTopicFilter, setActiveTopicFilter] = useState<string>('all')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set())
  const [session, setSession] = useState<{ access_token: string } | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    getSession()
  }, [])

  const fetchFeed = useCallback(async (topicList: string[]) => {
    setLoading(true)
    try {
      const topicsParam = topicList.join(',')
      const res = await fetch(`/api/feed?topics=${encodeURIComponent(topicsParam)}`)
      const data = await res.json()
      setArticles(data.articles || [])
    } catch (e) {
      console.error('Feed error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSaved = useCallback(async () => {
    if (!session) return
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'list' }),
      })
      const data = await res.json()
      setSavedUrls(new Set((data.saved || []).map((s: { article_url: string }) => s.article_url)))
    } catch (e) {
      console.error('Saved fetch error:', e)
    }
  }, [session])

  useEffect(() => {
    if (topics.length > 0) {
      fetchFeed(topics)
    }
  }, [topics, fetchFeed])

  useEffect(() => {
    if (session) {
      fetchSaved()
    }
  }, [session, fetchSaved])

  // Infinite scroll simulation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          setLoadingMore(true)
          // Re-fetch to get "more" (simulated)
          setTimeout(() => setLoadingMore(false), 1500)
        }
      },
      { threshold: 0.1 }
    )
    const el = loadMoreRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [loadingMore, loading])

  const handleSave = async (article: Article) => {
    if (!session) return
    const isSaved = savedUrls.has(article.url)
    const next = new Set(savedUrls)

    if (isSaved) {
      next.delete(article.url)
      setSavedUrls(next)
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsave', article }),
      })
    } else {
      next.add(article.url)
      setSavedUrls(next)
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', article }),
      })
    }
  }

  const filteredArticles = activeTopicFilter === 'all'
    ? articles
    : articles.filter(a => a.topic === activeTopicFilter)

  const heroArticle = filteredArticles[0]
  const restArticles = filteredArticles.slice(1)
  const trendingArticles = [...articles]
    .filter(a => a.type === 'reddit' && (a.upvotes || 0) > 100)
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, 6)

  if (activeTab === 'saved') {
    return (
      <div className="min-h-screen bg-[#080808]">
        <div className="pb-20">
          <SavedPage session={session} onBack={() => setActiveTab('feed')} onSave={handleSave} savedUrls={savedUrls} />
        </div>
        <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />
      </div>
    )
  }

  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[#080808]">
        <div className="p-6 pb-24">
          <ProfileTab user={user} topics={topics} onLogout={onLogout} />
        </div>
        <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />
      </div>
    )
  }

  if (activeTab === 'explore') {
    return (
      <div className="min-h-screen bg-[#080808]">
        <ExploreTab onTopicSelect={(topicId) => {
          setActiveTab('feed')
          setActiveTopicFilter(topicId)
        }} />
        <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />
      </div>
    )
  }

  if (activeTab === 'trending') {
    return (
      <div className="min-h-screen bg-[#080808]">
        <div className="p-4 pb-24">
          <h2 className="text-xl font-bold mb-4">🔥 Trending Now</h2>
          <div className="space-y-3">
            {trendingArticles.length === 0 ? (
              <p className="text-white/40 text-sm">Loading trending content...</p>
            ) : trendingArticles.map(a => (
              <ArticleCard key={a.id} article={a} variant="wide" isSaved={savedUrls.has(a.url)} onSave={handleSave} />
            ))}
          </div>
        </div>
        <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <span className="font-bold text-lg">Flowly</span>
          </div>
          <button
            onClick={() => fetchFeed(topics)}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Topic pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveTopicFilter('all')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTopicFilter === 'all'
                ? 'bg-white text-black pill-active'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {topics.map(topicId => {
            const topic = getTopicById(topicId)
            if (!topic) return null
            return (
              <button
                key={topicId}
                onClick={() => setActiveTopicFilter(topicId)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTopicFilter === topicId
                    ? `bg-gradient-to-r ${topic.gradient} text-white pill-active`
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                {topic.emoji} {topic.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Feed Content */}
      <div className="px-4 pb-24 pt-2">
        {loading ? (
          <FeedSkeleton />
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">No articles found</p>
          </div>
        ) : (
          <>
            {/* Hero Card */}
            {heroArticle && (
              <div className="mb-4">
                <ArticleCard article={heroArticle} variant="hero" isSaved={savedUrls.has(heroArticle.url)} onSave={handleSave} />
              </div>
            )}

            {/* Trending section */}
            {trendingArticles.length > 0 && activeTopicFilter === 'all' && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base font-bold">🔥 Trending Now</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {trendingArticles.slice(0, 5).map(a => (
                    <div key={a.id} className="flex-shrink-0 w-44">
                      <ArticleCard article={a} variant="small" isSaved={savedUrls.has(a.url)} onSave={handleSave} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2-column grid */}
            {restArticles.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {restArticles.slice(0, 4).map(a => (
                    <ArticleCard key={a.id} article={a} variant="small" isSaved={savedUrls.has(a.url)} onSave={handleSave} />
                  ))}
                </div>

                {/* Wide cards */}
                <div className="space-y-3 mb-4">
                  {restArticles.slice(4, 10).map(a => (
                    <ArticleCard key={a.id} article={a} variant="wide" isSaved={savedUrls.has(a.url)} onSave={handleSave} />
                  ))}
                </div>

                {/* More 2-column */}
                {restArticles.length > 10 && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {restArticles.slice(10, 16).map(a => (
                      <ArticleCard key={a.id} article={a} variant="small" isSaved={savedUrls.has(a.url)} onSave={handleSave} />
                    ))}
                  </div>
                )}

                {/* More wide cards */}
                {restArticles.length > 16 && (
                  <div className="space-y-3">
                    {restArticles.slice(16).map(a => (
                      <ArticleCard key={a.id} article={a} variant="wide" isSaved={savedUrls.has(a.url)} onSave={handleSave} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Load more sentinel */}
            <div ref={loadMoreRef} className="py-4 text-center">
              {loadingMore && (
                <div className="flex justify-center gap-2">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="skeleton h-52 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-36 rounded-2xl" />
        <div className="skeleton h-36 rounded-2xl" />
      </div>
      <div className="skeleton h-24 rounded-2xl" />
      <div className="skeleton h-24 rounded-2xl" />
      <div className="skeleton h-24 rounded-2xl" />
    </div>
  )
}

function ExploreTab({ onTopicSelect }: { onTopicSelect: (id: string) => void }) {
  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold mb-1">Explore</h2>
      <p className="text-white/40 text-sm mb-6">Browse all topics</p>
      <div className="grid grid-cols-2 gap-3">
        {TOPICS.map(topic => (
          <button
            key={topic.id}
            onClick={() => onTopicSelect(topic.id)}
            className={`bg-gradient-to-br ${topic.gradient} rounded-2xl p-4 text-left hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]`}
          >
            <div className="text-3xl mb-2">{topic.emoji}</div>
            <div className="font-bold text-sm">{topic.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ProfileTab({ user, topics, onLogout }: { user: User; topics: string[]; onLogout: () => void }) {
  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-3xl mx-auto mb-4">
          {user.email?.[0].toUpperCase() || '?'}
        </div>
        <h2 className="font-bold text-lg">{user.email}</h2>
        <p className="text-white/40 text-sm mt-1">{topics.length} topics followed</p>
      </div>

      <div className="mb-6">
        <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Your Topics</h3>
        <div className="flex flex-wrap gap-2">
          {topics.map(topicId => {
            const topic = getTopicById(topicId)
            if (!topic) return null
            return (
              <span key={topicId} className={`text-xs px-3 py-1.5 rounded-full font-medium ${topic.tag}`}>
                {topic.emoji} {topic.label}
              </span>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40">Member since</p>
          <p className="text-sm font-medium mt-0.5">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full mt-6 py-3 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white hover:border-white/20 transition-all"
      >
        Sign Out
      </button>
    </div>
  )
}

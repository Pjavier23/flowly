'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/lib/types'
import ArticleCard from './ArticleCard'

interface Props {
  session: { access_token: string } | null
  onBack: () => void
  onSave: (article: Article) => void
  savedUrls: Set<string>
}

interface SavedItem {
  id: string
  article_url: string
  article_title: string | null
  article_source: string | null
  article_topic: string | null
  saved_at: string
}

export default function SavedPage({ session, onSave, savedUrls }: Props) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSaved = async () => {
      if (!session) {
        setLoading(false)
        return
      }
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
        setSavedItems(data.saved || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchSaved()
  }, [session])

  const articles: Article[] = savedItems.map(item => ({
    id: item.id,
    title: item.article_title || 'Saved Article',
    url: item.article_url,
    source: item.article_source || 'Unknown',
    topic: item.article_topic || 'trending',
    publishedAt: item.saved_at,
    type: 'rss' as const,
  }))

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">★</span>
        <div>
          <h2 className="text-xl font-bold">Saved</h2>
          <p className="text-white/40 text-xs">{savedItems.length} articles</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <div className="text-5xl mb-4">☆</div>
          <p className="text-sm">No saved articles yet</p>
          <p className="text-xs mt-2 text-white/20">Tap ☆ on any article to save it</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(a => (
            <ArticleCard
              key={a.id}
              article={a}
              variant="wide"
              isSaved={savedUrls.has(a.url)}
              onSave={onSave}
            />
          ))}
        </div>
      )}
    </div>
  )
}

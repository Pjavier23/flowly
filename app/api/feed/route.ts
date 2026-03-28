import { NextRequest, NextResponse } from 'next/server'
import { RSS_FEEDS, REDDIT_FEEDS, getTopicById } from '@/lib/topics'
import { Article } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 30
export const revalidate = 300 // cache 5 min

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

async function fetchWithTimeout(url: string, timeout = 6000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Flowly/1.0; +https://flowly-pi.vercel.app)' },
      next: { revalidate: 300 },
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

async function fetchRSS(topic: string, url: string): Promise<Article[]> {
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) return []
    const text = await res.text()

    // Parse XML manually (no rss-parser needed, avoids bundling issues)
    const items: Article[] = []
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g) || 
                        text.match(/<entry>([\s\S]*?)<\/entry>/g) || []
    
    const channelTitle = text.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() || new URL(url).hostname

    for (const itemXml of itemMatches.slice(0, 8)) {
      const getField = (tag: string) => {
        const m = itemXml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
        return m?.[1]?.trim() || ''
      }
      const title = getField('title')
      if (!title) continue

      const link = getField('link') || itemXml.match(/href="([^"]+)"/)?.[1] || ''
      const pubDate = getField('pubDate') || getField('published') || getField('updated') || new Date().toISOString()
      const description = getField('description') || getField('summary') || getField('content')
      // Try multiple image sources
      const enclosureUrl = itemXml.match(/enclosure[^>]+url="([^"]+)"/i)?.[1]
      const mediaContent = itemXml.match(/media:content[^>]+url="([^"]+)"/i)?.[1] || 
                           itemXml.match(/media:thumbnail[^>]+url="([^"]+)"/i)?.[1]
      const imgMatch = description.match(/src="([^"]+\.(jpg|jpeg|png|webp|gif)[^"]*)"/i)
      const thumbnail = enclosureUrl?.match(/\.(jpg|jpeg|png|webp|gif)/i) ? enclosureUrl :
                        mediaContent?.match(/\.(jpg|jpeg|png|webp|gif)/i) ? mediaContent :
                        imgMatch?.[1]

      items.push({
        id: `rss-${topic}-${Math.random().toString(36).slice(2)}`,
        title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"'),
        url: link,
        source: channelTitle,
        topic,
        publishedAt: pubDate,
        thumbnail,
        emoji: getTopicById(topic)?.emoji || '📰',
        summary: description.replace(/<[^>]+>/g, '').slice(0, 150).trim(),
        type: 'rss' as const,
      })
    }
    return items
  } catch {
    return []
  }
}

async function fetchReddit(topic: string, url: string): Promise<Article[]> {
  try {
    const res = await fetchWithTimeout(url + '&raw_json=1')
    if (!res.ok) return []
    const data = await res.json()
    const posts = data?.data?.children || []
    return posts
      .filter((p: any) => !p.data.stickied && p.data.title && p.data.score > 10)
      .slice(0, 6)
      .map((p: any) => ({
        id: `reddit-${topic}-${p.data.id}`,
        title: p.data.title,
        url: p.data.url?.startsWith('http') ? p.data.url : `https://reddit.com${p.data.permalink}`,
        source: p.data.subreddit_name_prefixed || `r/${topic}`,
        topic,
        publishedAt: new Date(p.data.created_utc * 1000).toISOString(),
        thumbnail: p.data.thumbnail?.startsWith('http') ? p.data.thumbnail : 
                   p.data.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&'),
        emoji: getTopicById(topic)?.emoji || '🔴',
        summary: p.data.selftext?.slice(0, 150),
        upvotes: p.data.score,
        comments: p.data.num_comments,
        type: 'reddit' as const,
      }))
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const topicsParam = searchParams.get('topics') || 'world-news,tech,science'
  const topics = topicsParam.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

  const allFetches: Promise<Article[]>[] = []

  for (const topic of topics) {
    // RSS feeds
    const rssUrls = RSS_FEEDS[topic] || []
    for (const url of rssUrls) {
      allFetches.push(fetchRSS(topic, url))
    }
    // Reddit
    const redditUrl = REDDIT_FEEDS[topic]
    if (redditUrl) {
      allFetches.push(fetchReddit(topic, redditUrl))
    }
  }

  const results = await Promise.allSettled(allFetches)
  const articles: Article[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
    }
  }

  // Sort by date newest first
  const sorted = articles
    .filter(a => a.title && a.url && a.url !== '#')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  // Mix: top 5 pinned recent, rest shuffled for variety
  const top = sorted.slice(0, 5)
  const rest = shuffle(sorted.slice(5))

  return NextResponse.json(
    { articles: [...top, ...rest] },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
  )
}

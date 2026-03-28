import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { RSS_FEEDS, REDDIT_FEEDS, getTopicById } from '@/lib/topics'
import { Article } from '@/lib/types'

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Flowly/1.0)',
  },
})

async function fetchRSS(topic: string, url: string): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(url)
    return (feed.items || []).slice(0, 8).map((item, i) => ({
      id: `rss-${topic}-${i}-${Date.now()}-${Math.random()}`,
      title: item.title || 'Untitled',
      url: item.link || item.guid || '#',
      source: feed.title || new URL(url).hostname,
      topic,
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
      thumbnail: item.enclosure?.url || extractImageFromContent(item.content || item.contentSnippet || ''),
      emoji: getTopicById(topic)?.emoji || '📰',
      summary: item.contentSnippet?.slice(0, 150) || item.content?.replace(/<[^>]+>/g, '').slice(0, 150),
      type: 'rss' as const,
    }))
  } catch {
    return []
  }
}

function extractImageFromContent(content: string): string | undefined {
  const match = content.match(/<img[^>]+src="([^"]+)"/i)
  return match ? match[1] : undefined
}

async function fetchReddit(topic: string, url: string): Promise<Article[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Flowly/1.0)' },
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const posts = data?.data?.children || []
    return posts
      .filter((p: { data: { stickied?: boolean; title?: string } }) => !p.data.stickied && p.data.title)
      .slice(0, 8)
      .map((p: { data: { id: string; title: string; url: string; permalink: string; subreddit_name_prefixed: string; created_utc: number; thumbnail?: string; score: number; num_comments: number; selftext?: string } }, i: number) => ({
        id: `reddit-${topic}-${p.data.id || i}`,
        title: p.data.title,
        url: p.data.url?.startsWith('http') ? p.data.url : `https://reddit.com${p.data.permalink}`,
        source: p.data.subreddit_name_prefixed || `r/${topic}`,
        topic,
        publishedAt: new Date(p.data.created_utc * 1000).toISOString(),
        thumbnail: p.data.thumbnail?.startsWith('http') ? p.data.thumbnail : undefined,
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const topicsParam = searchParams.get('topics')
  const topics = topicsParam ? topicsParam.split(',').filter(Boolean) : []

  if (!topics.length) {
    return NextResponse.json({ articles: [] })
  }

  const allFetches: Promise<Article[]>[] = []

  for (const topic of topics) {
    const rssUrls = RSS_FEEDS[topic] || []
    for (const url of rssUrls) {
      allFetches.push(fetchRSS(topic, url))
    }
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

  // Sort by date, newest first, then shuffle a bit for variety
  const sorted = articles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  // Mix: keep top stories recent but shuffle the rest
  const top = sorted.slice(0, 10)
  const rest = shuffle(sorted.slice(10))

  return NextResponse.json({ articles: [...top, ...rest] })
}

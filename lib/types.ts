export interface Article {
  id: string
  title: string
  url: string
  source: string
  topic: string
  publishedAt: string
  thumbnail?: string
  emoji?: string
  summary?: string
  upvotes?: number
  comments?: number
  type: 'rss' | 'reddit'
}

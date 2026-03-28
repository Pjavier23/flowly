export const TOPICS = [
  { id: 'sports', label: 'Sports', emoji: '⚽', gradient: 'from-green-500 to-emerald-600', color: '#10b981', tag: 'bg-green-500/20 text-green-400' },
  { id: 'pop-culture', label: 'Pop Culture', emoji: '🎭', gradient: 'from-pink-500 to-rose-600', color: '#ec4899', tag: 'bg-pink-500/20 text-pink-400' },
  { id: 'science', label: 'Science', emoji: '🔬', gradient: 'from-cyan-500 to-blue-600', color: '#06b6d4', tag: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'music', label: 'Music', emoji: '🎵', gradient: 'from-purple-500 to-violet-600', color: '#a855f7', tag: 'bg-purple-500/20 text-purple-400' },
  { id: 'food', label: 'Food', emoji: '🍕', gradient: 'from-orange-500 to-amber-600', color: '#f97316', tag: 'bg-orange-500/20 text-orange-400' },
  { id: 'tech', label: 'Tech', emoji: '💻', gradient: 'from-blue-500 to-indigo-600', color: '#3b82f6', tag: 'bg-blue-500/20 text-blue-400' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮', gradient: 'from-red-500 to-rose-600', color: '#ef4444', tag: 'bg-red-500/20 text-red-400' },
  { id: 'world-news', label: 'World News', emoji: '🌍', gradient: 'from-teal-500 to-cyan-600', color: '#14b8a6', tag: 'bg-teal-500/20 text-teal-400' },
  { id: 'finance', label: 'Finance', emoji: '💰', gradient: 'from-yellow-500 to-amber-600', color: '#eab308', tag: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'health', label: 'Health', emoji: '🏃', gradient: 'from-lime-500 to-green-600', color: '#84cc16', tag: 'bg-lime-500/20 text-lime-400' },
  { id: 'travel', label: 'Travel', emoji: '✈️', gradient: 'from-sky-500 to-blue-600', color: '#0ea5e9', tag: 'bg-sky-500/20 text-sky-400' },
  { id: 'arts', label: 'Arts', emoji: '🎨', gradient: 'from-fuchsia-500 to-pink-600', color: '#d946ef', tag: 'bg-fuchsia-500/20 text-fuchsia-400' },
  { id: 'climate', label: 'Climate', emoji: '🌱', gradient: 'from-emerald-500 to-teal-600', color: '#10b981', tag: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'beauty', label: 'Beauty', emoji: '💄', gradient: 'from-rose-500 to-pink-600', color: '#f43f5e', tag: 'bg-rose-500/20 text-rose-400' },
  { id: 'animals', label: 'Animals', emoji: '🐾', gradient: 'from-amber-500 to-orange-600', color: '#f59e0b', tag: 'bg-amber-500/20 text-amber-400' },
  { id: 'trending', label: 'Trending', emoji: '🔥', gradient: 'from-red-500 to-orange-600', color: '#ef4444', tag: 'bg-red-500/20 text-red-400' },
]

export const RSS_FEEDS: Record<string, string[]> = {
  sports: [
    'https://www.skysports.com/rss/12040',
    'https://feeds.bbci.co.uk/sport/rss.xml',
  ],
  science: [
    'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    'https://www.sciencedaily.com/rss/top.xml',
  ],
  tech: [
    'https://feeds.feedburner.com/TechCrunch',
    'https://www.theverge.com/rss/index.xml',
  ],
  music: [
    'https://pitchfork.com/rss/news/feed.xml',
  ],
  food: [
    'https://www.seriouseats.com/atom.xml',
  ],
  'world-news': [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  ],
  finance: [
    'https://feeds.bloomberg.com/markets/news.rss',
  ],
  gaming: [
    'https://www.ign.com/articles.rss',
  ],
  health: [
    'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
  ],
  'pop-culture': [
    'https://variety.com/feed/',
    'https://deadline.com/feed/',
  ],
  travel: [
    'https://www.lonelyplanet.com/news/feed',
  ],
  climate: [
    'https://grist.org/feed/',
  ],
}

export const REDDIT_FEEDS: Record<string, string> = {
  sports: 'https://www.reddit.com/r/sports/hot.json?limit=10',
  science: 'https://www.reddit.com/r/science/hot.json?limit=10',
  'pop-culture': 'https://www.reddit.com/r/popculturechat/hot.json?limit=10',
  music: 'https://www.reddit.com/r/Music/hot.json?limit=10',
  gaming: 'https://www.reddit.com/r/gaming/hot.json?limit=10',
  'world-news': 'https://www.reddit.com/r/worldnews/hot.json?limit=10',
  tech: 'https://www.reddit.com/r/technology/hot.json?limit=10',
  finance: 'https://www.reddit.com/r/investing/hot.json?limit=10',
  health: 'https://www.reddit.com/r/health/hot.json?limit=10',
  travel: 'https://www.reddit.com/r/travel/hot.json?limit=10',
  climate: 'https://www.reddit.com/r/climate/hot.json?limit=10',
  food: 'https://www.reddit.com/r/food/hot.json?limit=10',
  animals: 'https://www.reddit.com/r/aww/hot.json?limit=10',
  arts: 'https://www.reddit.com/r/Art/hot.json?limit=10',
  beauty: 'https://www.reddit.com/r/beauty/hot.json?limit=10',
  trending: 'https://www.reddit.com/r/popular/hot.json?limit=10',
}

export function getTopicById(id: string) {
  return TOPICS.find(t => t.id === id)
}

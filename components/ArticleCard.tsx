'use client'

import { getTopicById } from '@/lib/topics'
import { Article } from '@/lib/types'

interface Props {
  article: Article
  variant: 'hero' | 'small' | 'wide'
  isSaved: boolean
  onSave: (article: Article) => void
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'recently'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ArticleCard({ article, variant, isSaved, onSave }: Props) {
  const topic = getTopicById(article.topic)
  const ta = timeAgo(article.publishedAt)

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-save-btn]')) return
    window.open(article.url, '_blank', 'noopener,noreferrer')
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSave(article)
  }

  if (variant === 'hero') {
    return (
      <div
        onClick={handleClick}
        className="feed-card relative rounded-2xl overflow-hidden cursor-pointer h-52 select-none"
      >
        {/* Background */}
        {article.thumbnail ? (
          <>
            <img
              src={article.thumbnail}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${topic?.gradient || 'from-gray-800 to-gray-900'} opacity-60`} />
        )}

        {/* Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
            {topic && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${topic.tag}`}>
                {topic.emoji} {topic.label}
              </span>
            )}
            {article.type === 'reddit' && (
              <span className="text-[10px] text-orange-400 font-semibold bg-orange-500/10 px-2 py-0.5 rounded-full">Reddit</span>
            )}
          </div>
          <h2 className="text-base font-bold leading-tight mb-2 line-clamp-2 text-white drop-shadow-lg">
            {article.title}
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="font-medium text-white/70">{article.source}</span>
              <span>·</span>
              <span>{ta}</span>
              {article.upvotes && article.upvotes > 0 && (
                <>
                  <span>·</span>
                  <span>↑ {article.upvotes > 1000 ? `${(article.upvotes / 1000).toFixed(1)}k` : article.upvotes}</span>
                </>
              )}
            </div>
            <button
              data-save-btn
              onClick={handleSave}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                isSaved ? 'bg-white/20 text-yellow-400' : 'bg-black/30 text-white/40 hover:text-white/70'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'small') {
    return (
      <div
        onClick={handleClick}
        className="feed-card relative rounded-xl overflow-hidden cursor-pointer bg-white/5 border border-white/8 p-3 select-none"
      >
        {/* Emoji icon */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic?.gradient || 'from-gray-700 to-gray-800'} flex items-center justify-center text-xl mb-2`}>
          {topic?.emoji || '📰'}
        </div>

        {/* Topic tag */}
        {topic && (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${topic.tag} mb-1.5 inline-block`}>
            {topic.label}
          </span>
        )}

        <h3 className="text-xs font-semibold leading-tight line-clamp-3 mb-2 text-white/90">
          {article.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] text-white/30">{ta}</span>
          <button
            data-save-btn
            onClick={handleSave}
            className={`text-[10px] transition-colors ${isSaved ? 'text-yellow-400' : 'text-white/20 hover:text-white/50'}`}
          >
            {isSaved ? '★' : '☆'}
          </button>
        </div>
      </div>
    )
  }

  // wide variant
  return (
    <div
      onClick={handleClick}
      className="feed-card flex gap-3 bg-white/5 border border-white/8 rounded-xl p-3 cursor-pointer select-none"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0">
        {article.thumbnail ? (
          <div className="w-20 h-16 rounded-lg overflow-hidden bg-white/10">
            <img
              src={article.thumbnail}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                const parent = (e.target as HTMLImageElement).parentElement
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br ${topic?.gradient || 'from-gray-700 to-gray-800'}">${topic?.emoji || '📰'}</div>`
                }
              }}
            />
          </div>
        ) : (
          <div className={`w-20 h-16 rounded-lg bg-gradient-to-br ${topic?.gradient || 'from-gray-700 to-gray-800'} flex items-center justify-center text-2xl`}>
            {topic?.emoji || '📰'}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {topic && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${topic.tag} mb-1 inline-block`}>
              {topic.emoji} {topic.label}
            </span>
          )}
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-white/90">
            {article.title}
          </h3>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <span className="text-white/50 font-medium">{article.source.replace('www.', '')}</span>
            <span>·</span>
            <span>{ta}</span>
            {article.upvotes && article.upvotes > 0 && (
              <>
                <span>·</span>
                <span>↑ {article.upvotes > 1000 ? `${(article.upvotes / 1000).toFixed(1)}k` : article.upvotes}</span>
              </>
            )}
            {article.comments && article.comments > 0 && (
              <>
                <span>·</span>
                <span>💬 {article.comments}</span>
              </>
            )}
          </div>
          <button
            data-save-btn
            onClick={handleSave}
            className={`text-sm transition-colors ${isSaved ? 'text-yellow-400' : 'text-white/20 hover:text-white/50'}`}
          >
            {isSaved ? '★' : '☆'}
          </button>
        </div>
      </div>
    </div>
  )
}

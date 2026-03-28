'use client'

type Tab = 'feed' | 'explore' | 'trending' | 'saved' | 'profile'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string; icon: string; activeIcon: string }[] = [
  { id: 'feed', label: 'Feed', icon: '⊞', activeIcon: '⊡' },
  { id: 'explore', label: 'Explore', icon: '◎', activeIcon: '●' },
  { id: 'trending', label: 'Trending', icon: '📈', activeIcon: '📈' },
  { id: 'saved', label: 'Saved', icon: '☆', activeIcon: '★' },
  { id: 'profile', label: 'Profile', icon: '○', activeIcon: '◉' },
]

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <div className="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 pb-safe">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
              isActive ? 'text-white' : 'text-white/30 hover:text-white/60'
            }`}
          >
            <span className={`text-xl leading-none transition-transform ${isActive ? 'scale-110' : ''}`}>
              {isActive ? tab.activeIcon : tab.icon}
            </span>
            <span className={`text-[9px] font-semibold uppercase tracking-wide ${isActive ? 'text-white' : 'text-white/30'}`}>
              {tab.label}
            </span>
            {isActive && (
              <div className="w-1 h-1 rounded-full bg-white mt-0.5" />
            )}
          </button>
        )
      })}
    </div>
  )
}

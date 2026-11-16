import { Maximize2, Minimize2 } from 'lucide-react';

export type NavSectionId = 'overview' | 'intelligence' | 'comfort' | 'modularity' | 'companion';

interface NavbarProps {
  activeNav: NavSectionId;
  isExpandedView: boolean;
  onSelectNav: (section: NavSectionId) => void;
  onToggleFullscreen: () => void;
}

export function Navbar({
  activeNav,
  isExpandedView,
  onSelectNav,
  onToggleFullscreen,
}: NavbarProps) {
  const navItems: Array<{ id: NavSectionId; label: string; mobileLabel: string }> = [
    { id: 'overview', label: 'Overview', mobileLabel: '3D' },
    { id: 'intelligence', label: 'Intelligence', mobileLabel: 'AI' },
    { id: 'comfort', label: 'Comfort', mobileLabel: 'Comfort' },
    { id: 'modularity', label: 'Modularity', mobileLabel: 'Modular' },
    { id: 'companion', label: 'App UI', mobileLabel: 'App' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-white/[0.07] bg-[#0B0D10]/95 px-3 py-2.5 sm:gap-6 sm:px-8 sm:py-3 lg:px-10">
      {/* Zone 1: NEXLIMB Wordmark */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onSelectNav('overview')}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-md"
          aria-label="NEXLIMB Overview"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-teal-400 shrink-0 sm:h-6 sm:w-6"
          >
            <path
              d="M6 3H11L13.5 9.5L18 14V21H14.5V15.5L10.5 11.5L7.5 21H4L8 9.5L6 3Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="14.5" cy="6.5" r="2" fill="currentColor" />
          </svg>
          <span className="font-display text-base font-semibold tracking-tight text-[#F3F5F8] whitespace-nowrap sm:text-lg">
            NEXLIMB
          </span>
        </button>

        <span aria-hidden="true" className="hidden xl:inline text-slate-600 text-xs">
          ·
        </span>
        <span className="hidden xl:inline text-[11px] font-medium tracking-[0.14em] text-[#8E98A8] whitespace-nowrap uppercase">
          Intelligent Prosthetic System
        </span>
      </div>

      {/* Zone 2: Scrollable Multi-Panel Navigation Links */}
      <nav aria-label="Primary navigation" className="flex items-center gap-2.5 sm:gap-6">
        {navItems.map((item) => {
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNav(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative py-1 text-[11px] sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded ${
                active
                  ? 'text-[#F3F5F8]'
                  : 'text-[#8E98A8] hover:text-[#E2E8F0]'
              }`}
            >
              <span className="sm:hidden">{item.mobileLabel}</span>
              <span className="hidden sm:inline">{item.label}</span>
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-1 h-[1.5px] bg-teal-400"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Fullscreen / Expanded 3D Viewport Action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-pressed={isExpandedView}
          aria-label={isExpandedView ? 'Exit fullscreen 3D view' : 'Expand fullscreen 3D view'}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-[#141820] px-2 text-xs font-medium text-[#E2E8F0] transition-colors hover:border-teal-400/50 hover:text-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0 sm:px-3"
        >
          {isExpandedView ? (
            <Minimize2 className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
          )}
          <span className="hidden md:inline">
            {isExpandedView ? 'Exit Focus' : 'Fullscreen'}
          </span>
        </button>
      </div>
    </header>
  );
}

import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { PanelLeft, Search, Flame, CheckCircle2, Keyboard } from 'lucide-react';

export default function Topbar({
  sidebarOpen,
  setSidebarOpen,
  onOpenCommandPalette,
  onOpenShortcuts,
  solvedCount = 0,
  streak = 0,
}) {
  const location = useLocation();

  // Compute breadcrumbs from current pathname
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/problems')) return 'Problem Bank';
    if (path.startsWith('/sheets/strivers')) return 'Strivers A2Z DSA Course';
    if (path.startsWith('/sheets/neetcode')) return 'NeetCode 150';
    if (path.startsWith('/sheets/dsa-patterns')) return 'Algorithmic Patterns';
    if (path.startsWith('/sheets')) return 'Curated Roadmaps';
    if (path.startsWith('/analytics')) return 'Performance Analytics';
    if (path.startsWith('/revision')) return 'Spaced Revision Queue';
    if (path.startsWith('/learn')) return 'Learn & Patterns';
    if (path.startsWith('/practice/companies') || path.startsWith('/company')) return 'Company Hub';
    if (path.startsWith('/practice/patterns')) return 'Pattern Training Lab';
    if (path.startsWith('/practice/interview') || path.startsWith('/interview')) return 'Mock Interview';
    if (path.startsWith('/practice/solve') || path.startsWith('/solve')) return 'Problem Solving';
    if (path.startsWith('/problem/')) return 'Problem Detail';
    return 'Workspace';
  };

  return (
    <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-xl flex items-center justify-between px-4 z-30 shrink-0 select-none">
      {/* Left: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors"
          title={sidebarOpen ? 'Collapse sidebar (⌘B)' : 'Expand sidebar (⌘B)'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-foreground-subtle font-medium">BaseCase</span>
          <span className="text-foreground-subtle/50">/</span>
          <span className="text-foreground font-semibold">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Center: Raycast-Style Global Command Bar Trigger */}
      <div className="flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full group flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-raised hover:bg-surface-hover border border-border hover:border-border-strong text-foreground-subtle hover:text-foreground-muted transition-all duration-150 shadow-inner-rim cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-xs truncate">
            <Search className="w-3.5 h-3.5 text-foreground-subtle group-hover:text-primary transition-colors" />
            <span className="truncate">Search commands, problems, roadmaps...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-foreground-subtle bg-surface border border-border rounded shadow-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Executive Stats & Shortcuts */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Solved Problems Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-xs shadow-inner-rim">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-foreground-subtle font-medium">Solved:</span>
          <span className="text-foreground font-semibold font-mono tabular-nums">
            {solvedCount}
          </span>
        </div>

        {/* Streak Counter */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs shadow-inner-rim transition-all ${
            streak > 0
              ? 'bg-accent-amber/10 border-accent-amber/30 text-amber-300'
              : 'bg-surface-raised border-border text-foreground-subtle'
          }`}
        >
          <Flame
            className={`w-3.5 h-3.5 ${
              streak > 0 ? 'text-accent-amber fill-accent-amber' : 'text-foreground-subtle'
            }`}
          />
          <span className="font-semibold font-mono tabular-nums text-foreground">
            {streak}
          </span>
          <span className="hidden lg:inline text-[10px] text-foreground-subtle font-medium">
            Day Streak
          </span>
        </div>

        {/* Keyboard Shortcuts Trigger */}
        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}

Topbar.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
  onOpenCommandPalette: PropTypes.func.isRequired,
  onOpenShortcuts: PropTypes.func,
  solvedCount: PropTypes.number,
  streak: PropTypes.number,
};

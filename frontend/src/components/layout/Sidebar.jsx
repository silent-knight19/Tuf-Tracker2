import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Code,
  RotateCw,
  BarChart2,
  BookOpen,
  Layers,
  Building2,
  Cpu,
  Target,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

export default function Sidebar({ open, setOpen, onOpenSettings }) {
  const location = useLocation();
  const { signOut, user } = useAuthStore();

  const mainNavigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Problem Bank', path: '/problems', icon: Code },
    { name: 'Curated Sheets', path: '/sheets', icon: Layers },
    { name: 'Spaced Revision', path: '/revision', icon: RotateCw },
    { name: 'Performance Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Learn & Patterns', path: '/learn', icon: BookOpen },
  ];

  const practiceNavigation = [
    { name: 'Pattern Focus', path: '/practice/patterns', icon: Target, desc: 'Algorithmic paradigms' },
    { name: 'Company Hub', path: '/practice/companies', icon: Building2, desc: 'Target company sets' },
    { name: 'Mock Interview', path: '/practice/interview', icon: Cpu, desc: 'AI live debrief' },
    { name: 'Problem Collection', path: '/practice/solve', icon: Code, desc: 'Custom practice' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-surface border-r border-border flex flex-col transition-all duration-250 ease-spring z-40 select-none shrink-0 ${
          open
            ? 'fixed inset-y-0 left-0 w-60 md:static shadow-2xl md:shadow-none'
            : 'w-0 md:w-16 overflow-hidden md:overflow-visible border-r-0 md:border-r'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-3.5 relative shrink-0">
          <Link to="/" onClick={handleNavClick} className="flex items-center gap-2.5 min-w-0 group">
            <div className="w-[38px] h-[38px] rounded-lg overflow-hidden shrink-0 border border-primary/30 shadow-sm shadow-primary/20 bg-surface flex items-center justify-center">
              <img src="/basecase-icon.png" alt="BaseCase" className="w-full h-full object-cover" />
            </div>
            {open && (
              <div className="flex items-center min-w-0">
                <span className="text-sm font-bold text-foreground tracking-tight truncate">
                  Base<span className="text-primary">Case</span>
                </span>
              </div>
            )}
          </Link>

        {/* Collapse Button */}
        <button
          onClick={() => setOpen(!open)}
          className="p-1 rounded-md text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors shrink-0"
          title={open ? 'Collapse sidebar (⌘B)' : 'Expand sidebar (⌘B)'}
        >
          {open ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-2.5 py-4 space-y-6 overflow-y-auto no-scrollbar">
        {/* Core Navigation */}
        <div className="space-y-0.5">
          {open && (
            <div className="px-2 pb-1.5 text-[10px] font-semibold text-foreground-subtle uppercase tracking-wider">
              Workspace
            </div>
          )}
          {mainNavigation.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-surface-raised text-foreground border border-border shadow-inner-rim'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover/60'
                } ${!open ? 'justify-center px-0' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    active
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground-subtle group-hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {open && <span className="truncate">{item.name}</span>}
              </Link>
            );

            return open ? (
              linkContent
            ) : (
              <Tooltip key={item.path} content={item.name} side="right">
                {linkContent}
              </Tooltip>
            );
          })}
        </div>

        {/* Training Labs */}
        <div className="space-y-0.5">
          {open && (
            <div className="px-2 pb-1.5 text-[10px] font-semibold text-foreground-subtle uppercase tracking-wider">
              Practice Labs
            </div>
          )}
          {practiceNavigation.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-surface-raised text-foreground border border-border shadow-inner-rim'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover/60'
                } ${!open ? 'justify-center px-0' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    active
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground-subtle group-hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {open && (
                  <div className="flex-1 min-w-0">
                    <div className="truncate leading-none">{item.name}</div>
                    <div className="text-[10px] text-foreground-subtle font-normal truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                )}
              </Link>
            );

            return open ? (
              linkContent
            ) : (
              <Tooltip key={item.path} content={`${item.name} — ${item.desc}`} side="right">
                {linkContent}
              </Tooltip>
            );
          })}
        </div>

        {/* Featured Course Sheet */}
        {open && (
          <div className="space-y-0.5">
            <div className="px-2 pb-1.5 text-[10px] font-semibold text-foreground-subtle uppercase tracking-wider">
              Curated Roadmap
            </div>
            <Link
              to="/sheets/strivers"
              className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive('/sheets/strivers')
                  ? 'bg-surface-raised text-foreground border border-border shadow-inner-rim'
                  : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover/60'
              }`}
            >
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-accent-amber bg-accent-amber/10">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate leading-none">Strivers A2Z DSA</div>
                <div className="text-[10px] text-accent-amber font-normal truncate mt-0.5">
                  455 Core Roadmap
                </div>
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* User Session Footer */}
      <div className="p-2 border-t border-border bg-surface-subtle/70 shrink-0">
        <div
          className={`flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-hover transition-colors ${
            !open ? 'justify-center' : ''
          }`}
        >
          {/* Avatar with status indicator */}
          <div className="relative shrink-0">
            <div className="w-7 h-7 rounded-lg bg-surface-raised border border-border-strong flex items-center justify-center text-foreground font-bold text-xs shadow-sm">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-surface rounded-full shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
          </div>

          {open && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate leading-tight">
                {user?.displayName || 'Engineer'}
              </div>
              <div className="text-[10px] text-foreground-subtle truncate leading-none mt-0.5">
                {user?.email || 'Active session'}
              </div>
            </div>
          )}

          {open && (
            <div className="flex items-center gap-0.5">
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  title="Workspace Settings"
                  className="p-1.5 rounded-md text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                className="p-1.5 rounded-md text-foreground-subtle hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func,
};

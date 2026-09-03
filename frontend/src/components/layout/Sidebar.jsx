import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  LayoutDashboard, 
  BarChart2, 
  RotateCw, 
  LogOut, 
  BookOpen, 
  Target, 
  Code, 
  Building2, 
  Cpu, 
  Layers, 
  FileText,
  Flame,
  ChevronRight
} from 'lucide-react';

function Sidebar({ open }) {
  const location = useLocation();
  const { signOut, user } = useAuthStore();

  const mainNavigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Curated Sheets', path: '/sheets', icon: Layers },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Spaced Revision', path: '/revision', icon: RotateCw },
    { name: 'Learn & Patterns', path: '/learn', icon: BookOpen },
  ];

  const practiceNavigation = [
    { name: 'Pattern Focus', path: '/practice/patterns', icon: Target, desc: 'Algorithmic paradigms' },
    { name: 'Company Hub', path: '/practice/companies', icon: Building2, desc: 'Target company sheets' },
    { name: 'Mock Interview', path: '/practice/interview', icon: Cpu, desc: 'AI interactive debrief' },
    { name: 'Problem Bank', path: '/practice/solve', icon: Code, desc: 'Custom collection' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={`bg-dark-950/90 backdrop-blur-2xl border-r border-white/[0.07] flex flex-col transition-all duration-300 ease-spring z-50 select-none ${
        open ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-white/[0.06] flex items-center px-5 relative shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-orange to-brand-amber flex items-center justify-center text-white shadow-md shadow-brand-orange/25 group-hover:shadow-brand-orange/40 transition-shadow">
            <Flame className="w-4.5 h-4.5 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-white tracking-tight">Tuf<span className="text-brand-orange">Tracker</span></span>
              <span className="text-[10px] font-semibold text-brand-amber bg-brand-orange/10 px-1.5 py-0.2 rounded-md border border-brand-orange/20">PRO</span>
            </div>
            <span className="text-[10px] text-dark-400 font-medium tracking-tight">DSA Mastery Platform</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 pt-5 space-y-6 overflow-y-auto no-scrollbar">
        {/* Core Navigation */}
        <div className="space-y-1">
          <div className="px-2.5 pb-1.5">
            <span className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">Framework</span>
          </div>
          {mainNavigation.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                  active 
                    ? 'bg-white/[0.06] text-white border-l-2 border-brand-orange rounded-l-none pl-2.5 shadow-sm' 
                    : 'text-dark-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  active 
                    ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/25 shadow-[0_0_10px_rgba(249,115,22,0.15)]' 
                    : 'bg-white/[0.03] text-dark-400 group-hover:text-dark-200 group-hover:bg-white/[0.06]'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Practice Labs */}
        <div className="space-y-1">
          <div className="px-2.5 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">Training Labs</span>
          </div>
          {practiceNavigation.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                  active 
                    ? 'bg-white/[0.06] text-white border-l-2 border-brand-orange rounded-l-none pl-2.5 shadow-sm' 
                    : 'text-dark-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  active 
                    ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/25 shadow-[0_0_10px_rgba(249,115,22,0.15)]' 
                    : 'bg-white/[0.03] text-dark-400 group-hover:text-dark-200 group-hover:bg-white/[0.06]'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="truncate block leading-tight">{item.name}</span>
                  <span className="text-[10px] text-dark-400 font-normal block truncate mt-0.5">{item.desc}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Curated SDE Sheets */}
        <div className="space-y-1">
          <div className="px-2.5 pb-1.5">
            <span className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">Featured Sheet</span>
          </div>
          <Link
            to="/sheets/strivers"
            className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
              isActive('/sheets/strivers')
                ? 'bg-white/[0.06] text-white border-l-2 border-brand-orange rounded-l-none pl-2.5 shadow-sm'
                : 'text-dark-300 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isActive('/sheets/strivers') 
                ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/25 shadow-[0_0_10px_rgba(249,115,22,0.15)]' 
                : 'bg-white/[0.03] text-dark-400 group-hover:text-dark-200'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="truncate block leading-tight">Strivers A2Z</span>
              <span className="text-[10px] text-brand-amber font-normal block truncate mt-0.5">454 Core Questions</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* User Profile & Session Footer */}
      <div className="p-3 border-t border-white/[0.06] bg-dark-900/60 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
          {/* Avatar with Status */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-orange to-brand-amber flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-dark-950 rounded-full" />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user?.displayName || 'Engineer'}
            </div>
            <div className="text-[10px] text-dark-400 truncate leading-none mt-0.5">{user?.email || 'Logged in'}</div>
          </div>

          {/* Eject / Sign Out Button */}
          <button
            onClick={signOut}
            title="Sign out"
            className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

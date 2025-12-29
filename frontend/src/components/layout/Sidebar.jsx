import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LayoutDashboard, BarChart2, RotateCw, LogOut, BookOpen, Target, Briefcase, Code, Building2 } from 'lucide-react';
import MotivationalQuote from '../ui/MotivationalQuote';

function Sidebar({ open }) {
  const location = useLocation();
  const { signOut, user } = useAuthStore();

  const mainNavigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, color: 'text-blue-400' },
    { name: 'Analytics', path: '/analytics', icon: BarChart2, color: 'text-green-400' },
    { name: 'Revision', path: '/revision', icon: RotateCw, color: 'text-brand-orange' },
    { name: 'Learn', path: '/learn', icon: BookOpen, color: 'text-purple-400' },
  ];

  const practiceNavigation = [
    { name: 'Pattern Focus', path: '/practice/patterns', icon: Target, color: 'text-purple-400', desc: 'Master algorithms' },
    { name: 'Company Prep', path: '/practice/companies', icon: Building2, color: 'text-green-400', desc: 'FAANG practice' },
    { name: 'Mock Interview', path: '/practice/interview', icon: Briefcase, color: 'text-blue-400', desc: 'AI-powered' },
    { name: 'Problem Bank', path: '/practice/solve', icon: Code, color: 'text-brand-orange', desc: 'Your collection' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside
      className={`bg-dark-950 border-r border-dark-800/60 flex flex-col transition-all duration-500 ease-in-out z-50 shadow-2xl ${
        open ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      {/* Logo Area */}
      <div className="h-16 border-b border-dark-800/60 flex items-center px-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="flex items-center gap-3 relative z-10">
          <h1 className="text-xl font-black tracking-tighter text-white uppercase group-hover:tracking-normal transition-all duration-500">
            Tuf<span className="text-brand-orange">Tracker</span>
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-6 pb-0 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Main Navigator */}
        <div className="space-y-1.5">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-black text-dark-600 uppercase tracking-[0.2em]">Framework</span>
          </div>
          {mainNavigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive(item.path) 
                  ? 'bg-brand-orange/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.2)]' 
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-900/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isActive(item.path) ? 'bg-brand-orange/20 shadow-inner' : 'bg-dark-900 group-hover:bg-dark-800'
              }`}>
                <item.icon className={`w-4.5 h-4.5 transition-colors ${isActive(item.path) ? 'text-brand-orange' : 'text-dark-500 group-hover:text-dark-300'}`} />
              </div>
              <span className={`font-bold text-sm tracking-tight ${isActive(item.path) ? 'text-white' : 'text-dark-400'}`}>
                {item.name}
              </span>
              {isActive(item.path) && (
                <div className="ml-auto w-1 h-1 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              )}
            </Link>
          ))}
        </div>

        {/* Practice Navigator */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 px-3 mb-4">
            <span className="text-[10px] font-black text-dark-600 uppercase tracking-[0.2em]">Training Labs</span>
            <div className="h-px flex-1 bg-dark-800/60" />
          </div>
          
          <div className="space-y-1">
            {practiceNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive(item.path) 
                    ? 'bg-dark-900 text-white border border-dark-800 shadow-xl' 
                    : 'text-dark-500 hover:text-dark-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                  isActive(item.path) 
                    ? 'bg-dark-800 border border-dark-700 shadow-inner' 
                    : 'bg-dark-950 border border-transparent group-hover:border-dark-800'
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive(item.path) ? item.color : 'text-dark-600 group-hover:' + item.color.replace('text-', 'text-')}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-[13px] block tracking-tight">{item.name}</span>
                  <span className="text-[10px] text-dark-600 font-bold uppercase tracking-wider block mt-0.5">{item.desc}</span>
                </div>
                {isActive(item.path) && (
                  <div className="w-1.5 h-6 rounded-full bg-brand-orange animate-in slide-in-from-right duration-500" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Motivational Quote - Daily Insight */}
      <div className="px-3 -mt-4 mb-2.5">
        <MotivationalQuote category="Discipline" size="lg" />
      </div>

      {/* Compact Profile & Eject Section */}
      <div className="p-3 bg-dark-900/30 border-t border-dark-800/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Avatar with Status */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-orange to-orange-700 flex items-center justify-center text-white font-black text-xs shadow-lg">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-dark-900 rounded-full" />
          </div>

          {/* User Info (Compact) */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-white truncate uppercase tracking-wider">
              {user?.displayName || 'Candidate'}
            </div>
            <div className="text-[9px] font-bold text-dark-600 truncate leading-none mt-0.5">{user?.email}</div>
          </div>

          {/* Minimal Eject Button */}
          <button
            onClick={signOut}
            title="Eject Session"
            className="p-2.5 rounded-lg bg-dark-950 border border-dark-800 hover:bg-red-500/10 hover:border-red-500/20 text-dark-500 hover:text-red-400 transition-all duration-300 active:scale-90"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

import { useMemo } from 'react';
import { ArrowRight, BookOpen, Clock, Target, Sparkles, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SheetsPage() {
  const navigate = useNavigate();

  // Read live solved counts from localStorage
  const progressStats = useMemo(() => {
    try {
      const strivers = JSON.parse(localStorage.getItem('strivers-a2z-solved') || '[]');
      const neetcode = JSON.parse(localStorage.getItem('neetcode150-solved') || '[]');
      const patterns = JSON.parse(localStorage.getItem('dsa-patterns-solved') || '[]');
      return {
        strivers: Array.isArray(strivers) ? strivers.length : 0,
        neetcode: Array.isArray(neetcode) ? neetcode.length : 0,
        patterns: Array.isArray(patterns) ? patterns.length : 0,
      };
    } catch {
      return { strivers: 0, neetcode: 0, patterns: 0 };
    }
  }, []);

  const sheets = [
    {
      id: 'strivers',
      name: 'Strivers A2Z DSA Course',
      subtitle: 'Complete A-to-Z Roadmap',
      badge: 'TakeUForward Foundation',
      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
      path: '/sheets/strivers',
      solvedCount: progressStats.strivers,
      totalCount: 455,
      gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
      borderColor: 'group-hover:border-orange-500/40',
      accentColor: 'text-brand-orange',
      stats: [
        { label: 'Problems', value: '455', icon: BookOpen },
        { label: 'Topics', value: '27 Modules', icon: Target },
        { label: 'Est. Time', value: '4–6 Months', icon: Clock },
      ],
      description: 'Comprehensive, structured algorithmic curriculum from core data structures to advanced graphs, dynamic programming, and tries.',
      features: ['Step-by-step', 'Recursion & DP', 'Graphs & Trees', 'Detailed Explanations'],
      renderIcon: () => (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 via-amber-600 to-rose-600 p-0.5 shadow-lg shadow-orange-500/20 shrink-0">
          <div className="w-full h-full bg-dark-950/90 rounded-[10px] flex items-center justify-center text-white">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 18l6-6-6-6" stroke="url(#orange-grad)" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6l-6 6 6 6" stroke="url(#orange-grad)" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 4l-2 16" stroke="currentColor" strokeOpacity="0.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316"/>
                  <stop offset="100%" stopColor="#fbbf24"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: 'neetcode',
      name: 'NeetCode 150',
      subtitle: 'Silicon Valley Interview Standard',
      badge: 'Interview Gold Standard',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
      path: '/sheets/neetcode',
      solvedCount: progressStats.neetcode,
      totalCount: 150,
      gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
      borderColor: 'group-hover:border-violet-500/40',
      accentColor: 'text-violet-400',
      stats: [
        { label: 'Problems', value: '150', icon: BookOpen },
        { label: 'Patterns', value: '15 Patterns', icon: Target },
        { label: 'Est. Time', value: '2–3 Months', icon: Clock },
      ],
      description: 'The definitive collection of high-frequency LeetCode questions covering core patterns tested at FAANG and high-growth startups.',
      features: ['Blind 75 Included', 'Two Pointers', 'Sliding Window', 'Dynamic Programming'],
      renderIcon: () => (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-500 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
          <div className="w-full h-full bg-dark-950/90 rounded-[10px] flex items-center justify-center text-white">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="6" cy="6" r="2.5" fill="#a78bfa" stroke="none"/>
              <circle cx="18" cy="6" r="2.5" fill="#a78bfa" stroke="none"/>
              <circle cx="12" cy="18" r="2.5" fill="#c084fc" stroke="none"/>
              <path d="M8 7l8 0M7 8l4 8M17 8l-4 8" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: 'dsa-patterns',
      name: 'Algorithmic Patterns',
      subtitle: 'Pattern-Based Problem Solving',
      badge: 'Core Paradigm Mastery',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      path: '/sheets/dsa-patterns',
      solvedCount: progressStats.patterns,
      totalCount: 148,
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/40',
      accentColor: 'text-emerald-400',
      stats: [
        { label: 'Problems', value: '148', icon: BookOpen },
        { label: 'Patterns', value: '13 Paradigms', icon: Target },
        { label: 'Est. Time', value: '6–8 Weeks', icon: Clock },
      ],
      description: 'Master hand-picked problems organized by algorithmic technique. Designed to train rapid problem intuition and solution drafting.',
      features: ['Monotonic Stack', 'Top K Elements', 'Fast & Slow Pointer', 'Subsets & BFS'],
      renderIcon: () => (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
          <div className="w-full h-full bg-dark-950/90 rounded-[10px] flex items-center justify-center text-white">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="2" stroke="#34d399"/>
              <rect x="14" y="3" width="7" height="7" rx="2" stroke="#34d399"/>
              <rect x="3" y="14" width="7" height="7" rx="2" stroke="#38bdf8"/>
              <rect x="14" y="14" width="7" height="7" rx="2" stroke="#38bdf8"/>
              <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" stroke="currentColor" strokeOpacity="0.4" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )
    },
  ];

  const totalCuratedProblems = sheets.reduce((acc, s) => acc + s.totalCount, 0);
  const totalSolvedAcrossSheets = sheets.reduce((acc, s) => acc + s.solvedCount, 0);
  const overallPercentage = Math.round((totalSolvedAcrossSheets / totalCuratedProblems) * 100);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-2xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" /> Curated Tracks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Curated SDE Roadmaps</h1>
          <p className="text-xs sm:text-sm text-dark-300 font-normal mt-1 max-w-2xl leading-relaxed">
            Industry-recognized problem progressions designed to build algorithmic mastery from ground up to FAANG interviews.
          </p>
        </div>

        {/* Aggregate Progress Pill */}
        <div className="flex items-center gap-4 glass-panel rounded-2xl p-3.5 px-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-dark-400 font-medium">Roadmap Completion</div>
            <div className="text-base font-bold text-white mt-0.5">
              {totalSolvedAcrossSheets} <span className="text-dark-500 text-xs font-normal">/ {totalCuratedProblems} ({overallPercentage}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sheets.map((sheet) => {
          const percent = Math.round((sheet.solvedCount / sheet.totalCount) * 100);
          return (
            <div
              key={sheet.id}
              onClick={() => navigate(sheet.path)}
              className={`group relative overflow-hidden rounded-2xl glass-panel p-6 cursor-pointer transition-all duration-300 ease-spring hover:-translate-y-1 shadow-luxe hover:shadow-luxe-hover border border-white/[0.08] ${sheet.borderColor} flex flex-col justify-between`}
            >
              {/* Subtle Radial Glow */}
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${sheet.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div className="relative z-10">
                {/* Header: Insignia & Title */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-2xs font-semibold border mb-2.5 ${sheet.badgeColor}`}>
                      {sheet.badge}
                    </span>
                    <h2 className="text-lg font-bold text-white group-hover:text-brand-orange transition-colors leading-snug">
                      {sheet.name}
                    </h2>
                    <p className="text-2xs text-dark-400 font-medium mt-0.5">
                      {sheet.subtitle}
                    </p>
                  </div>
                  {sheet.renderIcon()}
                </div>

                <p className="text-xs text-dark-300 font-normal leading-relaxed mb-5 line-clamp-3">
                  {sheet.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-dark-400 font-medium">Progress</span>
                    <span className="text-white font-semibold">
                      {sheet.solvedCount} / {sheet.totalCount} ({percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        sheet.id === 'strivers' ? 'bg-orange-500' :
                        sheet.id === 'neetcode' ? 'bg-violet-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* 3-Column Metrics */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.05] mb-5 text-center">
                  {sheet.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-xs font-bold text-white">{stat.value}</div>
                      <div className="text-[10px] text-dark-400 font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Core Topics Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {sheet.features.map((feat) => (
                    <span 
                      key={feat}
                      className="px-2 py-0.5 rounded-md text-2xs font-medium text-dark-300 bg-white/[0.03] border border-white/[0.06]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="relative z-10 pt-2">
                <button className="btn btn-primary w-full text-xs py-2 px-4 shadow-sm justify-between group/btn">
                  <span>Start Curriculum</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SheetsPage;

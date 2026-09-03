import { Plus, X, ArrowRight, ShieldCheck, RefreshCw, Zap, Layers, Award } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useProblemStore } from '../../stores/problemStore';
import { useRevisionStore } from '../../stores/revisionStore';
import { useNavigate } from 'react-router-dom';

function SolvedProblemsStats({ customProblems, onShowAddModal }) {
  const navigate = useNavigate();
  const { problems: storeProblems, setFilters, filters } = useProblemStore();
  const { revisions, counts } = useRevisionStore();
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' or 'patterns'

  const problems = customProblems || storeProblems;

  // Calculate stats
  const stats = useMemo(() => {
    const total = problems.length;
    const easy = problems.filter(p => p.difficulty === 'Easy').length;
    const medium = problems.filter(p => p.difficulty === 'Medium').length;
    const hard = problems.filter(p => p.difficulty === 'Hard').length;

    // Aggregate topics
    const topicsMap = {};
    problems.forEach(p => {
      p.topics?.forEach(t => {
        topicsMap[t] = (topicsMap[t] || 0) + 1;
      });
    });
    const topics = Object.entries(topicsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Aggregate patterns
    const patternsMap = {};
    problems.forEach(p => {
      p.patterns?.forEach(pat => {
        patternsMap[pat] = (patternsMap[pat] || 0) + 1;
      });
    });
    const patterns = Object.entries(patternsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { total, easy, medium, hard, topics, patterns };
  }, [problems]);

  // Overall retention score
  const retentionHealth = useMemo(() => {
    if (!revisions || revisions.length === 0) return 100;
    const totalScore = revisions.reduce((acc, r) => acc + (r.healthScore || 3), 0);
    const maxScore = revisions.length * 5;
    return Math.round((totalScore / maxScore) * 100);
  }, [revisions]);

  const activeRevisionsCount = (counts?.dueToday || 0) + (counts?.overdue || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 mb-6">
      
      {/* Tile 1: Problem Velocity & Difficulty Gauge (4 cols) */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        {/* Ambient Top Light */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/[0.06] blur-2xl pointer-events-none rounded-full" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xs font-semibold uppercase tracking-wider text-dark-400">Problem Velocity</span>
            <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Sync
            </span>
          </div>

          {/* Solved Metric Hero */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-extrabold text-white tracking-tight">{stats.total}</span>
            <span className="text-xs text-dark-400 font-medium">Problems Solved</span>
          </div>

          {/* Difficulty Micro Bars */}
          <div className="space-y-2.5 mb-5">
            {[
              { label: 'Easy', count: stats.easy, color: 'bg-emerald-500', dot: 'bg-emerald-400', key: 'Easy' },
              { label: 'Medium', count: stats.medium, color: 'bg-amber-500', dot: 'bg-amber-400', key: 'Medium' },
              { label: 'Hard', count: stats.hard, color: 'bg-rose-500', dot: 'bg-rose-400', key: 'Hard' }
            ].map(tier => {
              const pct = stats.total > 0 ? Math.round((tier.count / stats.total) * 100) : 0;
              return (
                <div 
                  key={tier.label}
                  onClick={() => setFilters({ difficulty: filters.difficulty === tier.key ? '' : tier.key })}
                  className="group/bar cursor-pointer"
                >
                  <div className="flex items-center justify-between text-2xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
                      <span className="text-dark-300 font-medium group-hover/bar:text-white transition-colors">{tier.label}</span>
                    </div>
                    <span className="text-dark-400 font-medium">
                      <strong className="text-white font-semibold">{tier.count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${tier.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {onShowAddModal && (
          <button 
            onClick={onShowAddModal}
            className="btn btn-primary w-full text-xs py-2 px-3 shadow-sm justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Problem</span>
          </button>
        )}
      </div>

      {/* Tile 2: Spaced Repetition & Retention Pulse (4 cols) */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-amber/[0.05] blur-2xl pointer-events-none rounded-full" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xs font-semibold uppercase tracking-wider text-dark-400">Retention Health</span>
            <span className="inline-flex items-center gap-1 text-2xs font-medium text-brand-amber bg-brand-orange/10 border border-brand-orange/20 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-2.5 h-2.5" /> SM-2 Engine
            </span>
          </div>

          {/* Retention Health Score */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-extrabold text-white tracking-tight">{retentionHealth}%</span>
            <span className="text-xs text-dark-400 font-medium">Memory Retention</span>
          </div>

          {/* Review Status Matrix */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5">
              <div className="text-2xs text-dark-400 font-medium">In Queue Today</div>
              <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                <span>{activeRevisionsCount}</span>
                {activeRevisionsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                )}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5">
              <div className="text-2xs text-dark-400 font-medium">Overdue Revisions</div>
              <div className="text-lg font-bold text-white mt-0.5">
                <span className={counts?.overdue > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {counts?.overdue || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/revision')}
          className="btn btn-secondary w-full text-xs py-2 px-3 shadow-sm justify-between group/rev"
        >
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-brand-orange" />
            <span>Open Revision Lab</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-dark-400 group-hover/rev:text-white group-hover/rev:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Tile 3: Algorithmic Topic & Pattern Cloud (4 cols) */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div>
          {/* Segmented Tab Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xs font-semibold uppercase tracking-wider text-dark-400">Knowledge Cloud</span>
            <div className="flex p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
              <button
                onClick={() => setActiveTab('topics')}
                className={`px-2 py-0.5 text-2xs font-semibold rounded-md transition-all ${
                  activeTab === 'topics' 
                    ? 'bg-white/[0.1] text-white shadow-sm' 
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                Topics ({stats.topics.length})
              </button>
              <button
                onClick={() => setActiveTab('patterns')}
                className={`px-2 py-0.5 text-2xs font-semibold rounded-md transition-all ${
                  activeTab === 'patterns' 
                    ? 'bg-white/[0.1] text-white shadow-sm' 
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                Patterns ({stats.patterns.length})
              </button>
            </div>
          </div>

          {/* Active Tag Cloud */}
          <div className="space-y-2 mb-4">
            {activeTab === 'topics' ? (
              stats.topics.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar pr-1">
                  {stats.topics.map(t => {
                    const isActive = (filters.topics || []).includes(t.name);
                    return (
                      <button
                        key={t.name}
                        onClick={() => setFilters({ topics: isActive ? '' : t.name })}
                        className={`px-2 py-1 rounded-lg text-2xs font-medium border transition-all flex items-center gap-1.5 ${
                          isActive 
                            ? 'bg-brand-orange/15 border-brand-orange text-brand-orange' 
                            : 'bg-white/[0.03] border-white/[0.07] text-dark-300 hover:text-white hover:border-white/[0.15]'
                        }`}
                      >
                        <span>{t.name}</span>
                        <span className="px-1 py-0.2 rounded bg-white/[0.06] text-dark-400 font-mono text-[10px]">
                          {t.count}
                        </span>
                        {isActive && <X className="w-2.5 h-2.5" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-dark-500 italic">
                  No topics logged yet
                </div>
              )
            ) : (
              stats.patterns.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar pr-1">
                  {stats.patterns.map(p => {
                    const isActive = (filters.patterns || []).includes(p.name);
                    return (
                      <button
                        key={p.name}
                        onClick={() => setFilters({ patterns: isActive ? '' : p.name })}
                        className={`px-2 py-1 rounded-lg text-2xs font-medium border transition-all flex items-center gap-1.5 ${
                          isActive 
                            ? 'bg-brand-orange/15 border-brand-orange text-brand-orange' 
                            : 'bg-white/[0.03] border-white/[0.07] text-dark-300 hover:text-white hover:border-white/[0.15]'
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="px-1 py-0.2 rounded bg-white/[0.06] text-dark-400 font-mono text-[10px]">
                          {p.count}
                        </span>
                        {isActive && <X className="w-2.5 h-2.5" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-dark-500 italic">
                  No patterns recorded yet
                </div>
              )
            )}
          </div>
        </div>

        {/* Foundational Recommendation Strip */}
        <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-2xs text-dark-400">
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-dark-500" />
            <span>Click any tag to filter problems</span>
          </div>
          <span className="text-dark-500 font-mono">21st.dev matrix</span>
        </div>
      </div>

    </div>
  );
}

export default SolvedProblemsStats;

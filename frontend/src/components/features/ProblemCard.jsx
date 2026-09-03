import { Building2, Calendar, Repeat, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useRevisionStore } from '../../stores/revisionStore';

function ProblemCard({ problem, onClick }) {
  // Reactive revision lookup
  const revision = useRevisionStore(state => 
    state.revisions.find(r => r.problemId === problem.id)
  );

  // Helper to convert Firestore timestamp or ISO string to Date safely
  const parseFirestoreDate = (date) => {
    if (!date) return null;
    if (date._seconds) return new Date(date._seconds * 1000);
    if (date.seconds) return new Date(date.seconds * 1000);
    if (typeof date.toDate === 'function') return date.toDate();
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(`/problem/${problem.id}`, '_blank');
    }
  };

  const isSolved = Boolean(problem.status === 'Solved' || problem.status === 'Completed' || problem.solvedAt);
  const solvedDate = parseFirestoreDate(problem.solvedAt || problem.updatedAt);

  return (
    <div 
      className="group relative bg-dark-850/70 hover:bg-dark-800/80 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-5 transition-all duration-300 ease-spring hover:-translate-y-1 shadow-luxe hover:shadow-luxe-hover cursor-pointer flex flex-col justify-between overflow-hidden"
      onClick={handleClick}
    >
      {/* Subtle Ambient Hover Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-brand-orange/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        {/* Top Header: Platform & Difficulty */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Platform Tag */}
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              problem.platform === 'LeetCode' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : problem.platform === 'GeeksforGeeks' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20'
            }`}>
              {problem.platform || 'LeetCode'}
            </span>

            {revision && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-amber bg-brand-orange/10 border border-brand-orange/20 px-2 py-0.5 rounded-md">
                <Repeat className="w-2.5 h-2.5" />
                In Queue
              </span>
            )}
          </div>

          {/* Luminous Difficulty Pill */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold tracking-tight border ${
            problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
            problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
            'bg-rose-500/10 text-rose-400 border-rose-500/25'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              problem.difficulty === 'Easy' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' :
              problem.difficulty === 'Medium' ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' :
              'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
            }`} />
            {problem.difficulty || 'Medium'}
          </div>
        </div>

        {/* Problem Title */}
        <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-brand-orange transition-colors leading-snug tracking-tight mb-2.5 line-clamp-2">
          {problem.title}
        </h3>

        {/* Topics & Pattern Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {problem.topics?.slice(0, 2).map((topic) => (
            <span 
              key={topic} 
              className="text-2xs font-medium text-dark-300 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md"
            >
              {topic}
            </span>
          ))}
          {problem.patterns?.slice(0, 1).map((pattern) => (
            <span 
              key={pattern} 
              className="text-2xs font-medium text-brand-amber bg-brand-orange/[0.06] border border-brand-orange/15 px-2 py-0.5 rounded-md"
            >
              {pattern}
            </span>
          ))}
        </div>

        {/* Companies Row */}
        {problem.companies && problem.companies.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3.5 text-dark-400 text-2xs">
            <Building2 className="w-3 h-3 text-dark-500 shrink-0" />
            <div className="flex items-center gap-1 truncate">
              {problem.companies.slice(0, 3).map((company, idx) => (
                <span key={idx} className="font-medium text-dark-300">
                  {company}{idx < Math.min(problem.companies.length, 3) - 1 ? ' ·' : ''}
                </span>
              ))}
              {problem.companies.length > 3 && (
                <span className="text-2xs text-dark-500 font-semibold">+{problem.companies.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Solved State & Quick Action */}
      <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-2xs font-medium">
          {isSolved ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solved</span>
              {solvedDate && (
                <span className="text-dark-400 ml-1">
                  · {solvedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-dark-400">
              <Clock className="w-3.5 h-3.5 text-dark-500" />
              <span>Unsolved</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-dark-400 group-hover:text-white group-hover:bg-brand-orange group-hover:border-brand-orange transition-all duration-200 shadow-sm">
          <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  );
}

export default ProblemCard;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Calendar, ArrowRight, AlertCircle, CheckCircle, RefreshCw, Sprout } from 'lucide-react';

function RevisionProblemCard({ revision }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Status icons
  const StatusIcon = {
    fresh: Sprout,
    needs_revision: RefreshCw,
    mastered: CheckCircle
  }[revision.bucket] || Sprout;

  const statusColor = {
    fresh: 'text-green-400',
    needs_revision: 'text-brand-orange',
    mastered: 'text-brand-yellow'
  }[revision.bucket] || 'text-green-400';

  // Difficulty colors
  const difficultyColors = {
    Easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  // Pattern colors
  const patternColors = {
    'Two Pointers': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Sliding Window': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Binary Search': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Dynamic Programming': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'Tree': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Graph': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    default: 'bg-dark-700 text-dark-300 border-dark-600'
  };

  const getPatternColor = (pattern) => patternColors[pattern] || patternColors.default;

  const formatDate = (date) => {
    if (!date) return 'No date';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleStartReview = (e) => {
    e.stopPropagation();
    window.open(`/revision/${revision.id}/review`, '_blank');
  };

  return (
    <div 
      className={`group relative bg-dark-900/40 backdrop-blur-3xl border rounded-[2.5rem] p-8 transition-all duration-500 ease-out hover:scale-[2] hover:-translate-y-24 hover:rotate-1 hover:z-[100] cursor-pointer overflow-hidden ${
        revision.overdueDays > 0 
          ? 'border-red-500/30 hover:border-red-500 hover:shadow-[0_120px_300px_-20px_rgba(239,68,68,0.6)]' 
          : 'border-dark-800 hover:border-brand-orange hover:shadow-[0_120px_300px_-20px_rgba(249,115,22,0.5)]'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity ${
        revision.overdueDays > 0 ? 'bg-red-500' : 'bg-brand-orange'
      }`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${difficultyColors[revision.difficulty]}`}>
                {revision.difficulty}
              </span>
              {revision.pattern && (
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getPatternColor(revision.pattern)}`}>
                  {revision.pattern}
                </span>
              )}
            </div>
            <h4 className="text-xl font-black text-white group-hover:text-brand-orange transition-colors truncate">
              {revision.problemTitle || 'Untitled Problem'}
            </h4>
          </div>

          <div className={`w-12 h-12 rounded-xl bg-dark-950 border border-dark-800 flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${statusColor}`}>
            <StatusIcon className="w-6 h-6 drop-shadow-md" />
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-dark-800/60">
          <div className="flex items-center gap-6">
            {revision.overdueDays > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] font-black text-red-400 uppercase tracking-wider">{revision.overdueDays}d overdue</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-dark-950 border border-dark-800 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-dark-500" />
                <span className="text-[11px] font-black text-dark-400 uppercase tracking-widest">Next Review: {formatDate(revision.nextDueDate)}</span>
              </div>
            )}

            {/* Health Score Mastery */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-dark-600 uppercase tracking-widest">Mastery</span>
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-1 rounded-full transition-all duration-500 ${
                      i < (revision.healthScore || 0) 
                        ? 'bg-brand-yellow shadow-[0_0_8px_rgba(234,179,8,0.4)]' 
                        : 'bg-dark-800'
                    }`} 
                    style={{ transform: i < (revision.healthScore || 0) ? `scaleX(${1 + i * 0.1})` : 'none' }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartReview}
            className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-orange/20 hover:bg-orange-600 active:scale-95 transition-all group-hover:translate-x-0"
          >
            Start Mission <ArrowRight className="w-4 h-4 animate-pulse" />
          </button>
        </div>

        {/* Expanded Intelligence */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-dark-800/60 space-y-4 animate-in slide-in-from-top-4 duration-500">
            {revision.coreIdea && (
              <div className="bg-dark-950/80 rounded-2xl p-5 border border-dark-800/60 relative overflow-hidden group/idea">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-orange" />
                <div className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] mb-3">Tactical Brief</div>
                <p className="text-sm text-dark-200 font-medium leading-relaxed italic">
                   "{revision.coreIdea}"
                </p>
              </div>
            )}

            <div className="flex gap-4 items-center justify-end">
               <button
                  onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/revision/${revision.id}`, '_blank');
                }}
                className="text-[10px] font-black text-dark-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
              >
                Intelligence Report <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

RevisionProblemCard.propTypes = {
  revision: PropTypes.shape({
    id: PropTypes.string.isRequired,
    problemId: PropTypes.string,
    problemTitle: PropTypes.string,
    difficulty: PropTypes.string,
    pattern: PropTypes.string,
    coreIdea: PropTypes.string,
    algorithmSteps: PropTypes.arrayOf(PropTypes.string),
    edgeCases: PropTypes.arrayOf(PropTypes.string),
    nextDueDate: PropTypes.any,
    overdueDays: PropTypes.number,
    bucket: PropTypes.string,
    healthScore: PropTypes.number
  }).isRequired
};

export default RevisionProblemCard;

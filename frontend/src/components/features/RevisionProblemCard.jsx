import { useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, ArrowRight, AlertCircle, CheckCircle2, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

function RevisionProblemCard({ revision }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Status icons
  const StatusIcon = {
    fresh: Sparkles,
    needs_revision: RefreshCw,
    mastered: CheckCircle2
  }[revision.bucket] || Sparkles;

  const statusColor = {
    fresh: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    needs_revision: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
    mastered: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  }[revision.bucket] || 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  const formatDate = (date) => {
    if (!date) return 'No date';
    const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
    return isNaN(d.getTime()) ? 'Pending' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleStartReview = (e) => {
    e.stopPropagation();
    window.open(`/revision/${revision.id}/review`, '_blank');
  };

  const isOverdue = revision.overdueDays > 0;

  return (
    <div 
      className={`group relative bg-dark-850/60 hover:bg-dark-800/70 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 ease-spring hover:-translate-y-0.5 shadow-luxe hover:shadow-luxe-hover cursor-pointer overflow-hidden ${
        isOverdue 
          ? 'border-rose-500/30 hover:border-rose-500/50' 
          : 'border-white/[0.08] hover:border-white/[0.16]'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Ambient Accent Light */}
      <div className={`absolute top-0 right-0 w-36 h-36 blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none ${
        isOverdue ? 'bg-rose-500' : 'bg-brand-orange'
      }`} />

      <div className="relative z-10">
        {/* Header: Difficulty, Pattern & Bucket Icon */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* Luminous Difficulty Pill */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-2xs font-semibold rounded-full border ${
                revision.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                revision.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  revision.difficulty === 'Easy' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' :
                  revision.difficulty === 'Medium' ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' :
                  'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                }`} />
                {revision.difficulty || 'Medium'}
              </span>

              {revision.pattern && (
                <span className="text-2xs font-medium text-dark-300 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md">
                  {revision.pattern}
                </span>
              )}
            </div>

            <h4 className="text-base font-semibold text-white group-hover:text-brand-orange transition-colors truncate">
              {revision.problemTitle || 'Untitled Problem'}
            </h4>
          </div>

          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${statusColor}`}>
            <StatusIcon className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Footer Metrics & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.05] mt-3">
          <div className="flex items-center gap-4">
            {isOverdue ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/25 rounded-full text-rose-400 text-2xs font-semibold">
                <AlertCircle className="w-3 h-3" />
                <span>{revision.overdueDays}d overdue</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full text-dark-300 text-2xs font-medium">
                <Calendar className="w-3 h-3 text-dark-400" />
                <span>Due: {formatDate(revision.nextDueDate)}</span>
              </div>
            )}

            {/* Health Score Dots */}
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-dark-400 font-medium">Mastery:</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < (revision.healthScore || 0) 
                        ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]' 
                        : 'bg-white/[0.08]'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartReview}
              className="btn btn-primary text-xs py-1.5 px-3.5 shadow-sm"
            >
              <span>Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="p-1 text-dark-500 group-hover:text-dark-300 transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Expanded Intuition Preview */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {revision.coreIdea && (
              <div className="bg-dark-900/60 rounded-xl p-4 border border-white/[0.06]">
                <div className="text-2xs font-semibold text-brand-amber uppercase tracking-wider mb-1.5">Core Intuition</div>
                <p className="text-xs text-dark-200 font-normal leading-relaxed italic">
                  "{revision.coreIdea}"
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/revision/${revision.id}`, '_blank');
                }}
                className="text-2xs font-semibold text-dark-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Full Debrief Log</span>
                <ArrowRight className="w-3 h-3" />
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

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
      className={`group relative bg-dark-800 border border-dark-700 rounded-xl p-5 transition-all duration-300 hover:border-brand-orange/50 hover:shadow-lg hover:shadow-brand-orange/5 cursor-pointer ${
        revision.overdueDays > 0 ? 'border-red-500/30' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Overdue Indicator */}
      {revision.overdueDays > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${difficultyColors[revision.difficulty]}`}>
              {revision.difficulty}
            </span>
            <h4 className="text-base font-bold text-white truncate group-hover:text-brand-orange transition-colors">
              {revision.problemTitle || 'Untitled Problem'}
            </h4>
          </div>
          
          {revision.pattern && (
            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border ${getPatternColor(revision.pattern)}`}>
              {revision.pattern}
            </span>
          )}
        </div>

        <div className={`p-2 rounded-lg bg-dark-900/50 ${statusColor}`}>
          <StatusIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-700/50">
        <div className="flex items-center gap-4">
          {revision.overdueDays > 0 ? (
            <div className="flex items-center gap-2 text-sm text-red-400 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{revision.overdueDays}d overdue</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <Calendar className="w-4 h-4" />
              <span>Next: {formatDate(revision.nextDueDate)}</span>
            </div>
          )}

          {/* Health Score Dots */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full ${
                  i < (revision.healthScore || 0) ? 'bg-brand-yellow' : 'bg-dark-700'
                }`} 
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleStartReview}
          className="flex items-center gap-1 text-sm font-bold text-brand-orange opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
        >
          Start Review <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-dark-700/50 space-y-4 animate-fadeIn">
          {revision.coreIdea && (
            <div className="bg-dark-900/50 rounded p-4 border border-dark-700/50">
              <div className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Core Idea</div>
              <p className="text-sm text-dark-200 italic leading-relaxed">"{revision.coreIdea}"</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
                onClick={(e) => {
                e.stopPropagation();
                window.open(`/revision/${revision.id}`, '_blank');
              }}
              className="text-sm text-dark-400 hover:text-white transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}
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

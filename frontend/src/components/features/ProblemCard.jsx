import { Building2, Calendar, Repeat, CheckCircle2 } from 'lucide-react';
import { useRevisionStore } from '../../stores/revisionStore';
import { useNavigate } from 'react-router-dom';

function ProblemCard({ problem }) {
  const navigate = useNavigate();
  const { addToRevisionQueue } = useRevisionStore();
  // Use selector to ensure reactivity when revisions change
  const revision = useRevisionStore(state => 
    state.revisions.find(r => r.problemId === problem.id)
  );

  const difficultyColors = {
    Easy: 'badge-easy',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  };

  const handleViewRevision = (e) => {
    e.stopPropagation();
    if (revision) {
      navigate(`/revision/${revision.id}`);
    }
  };

  return (
    <div 
      className="card card-hover cursor-pointer"
      onClick={() => navigate(`/problem/${problem.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <h3 className="text-lg font-semibold text-dark-100 mb-2">
            {problem.title}
          </h3>

          {/* Topics & Patterns */}
          <div className="flex flex-wrap gap-2 mb-3">
            {problem.topics?.slice(0, 3).map((topic) => (
              <span key={topic} className="badge bg-dark-800 text-dark-300 border-dark-700">
                {topic}
              </span>
            ))}
            {problem.patterns?.slice(0, 2).map((pattern) => (
              <span key={pattern} className="badge bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                {pattern}
              </span>
            ))}
          </div>

          {/* Companies */}
          {problem.companies && problem.companies.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <Building2 className="w-4 h-4" />
              <span>{problem.companies.slice(0, 3).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Difficulty Badge */}
        <span className={`badge ${difficultyColors[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-dark-800 flex items-center justify-between text-sm text-dark-400">
        <div className="flex items-center gap-4">
          <span>{problem.platform}</span>
          {problem.solvedAt && (
            <span>
              Solved {new Date(problem.solvedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {revision && (
            <button
              onClick={handleViewRevision}
              className="text-xs flex items-center gap-1 text-brand-orange hover:underline bg-brand-orange/10 px-2 py-1 rounded border border-brand-orange/20"
            >
              <Repeat className="w-3 h-3" />
              In Revision
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemCard;

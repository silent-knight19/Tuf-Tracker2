import { ChevronLeft, ExternalLink, Sprout, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function RevisionHeader({ revision }) {
  const navigate = useNavigate();

  const StatusIcon = {
    fresh: Sprout,
    mastered: CheckCircle,
    needs_revision: RefreshCw
  }[revision.bucket] || Sprout;

  const statusLabel = {
    fresh: 'Fresh',
    mastered: 'Mastered',
    needs_revision: 'In Progress'
  }[revision.bucket] || 'Fresh';

  return (
    <div className="sticky top-0 z-20 bg-dark-950/80 backdrop-blur-md border-b border-dark-800 px-6 py-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/revision')}
          className="p-2 rounded-full hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">{revision.problemTitle}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
              revision.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              revision.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {revision.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-dark-800 text-dark-300 border border-dark-700 flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Actions removed */}
      </div>
    </div>
  );
}

export default RevisionHeader;

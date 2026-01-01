import { Building2, Calendar, Repeat, Terminal, Clock } from 'lucide-react';
import { useRevisionStore } from '../../stores/revisionStore';
import { useNavigate } from 'react-router-dom';

function ProblemCard({ problem, onClick }) {
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

  // Helper to convert Firestore timestamp or ISO string to Date
  const parseFirestoreDate = (date) => {
    if (!date) return null;
    // Handle Firestore Timestamp object (serialized as _seconds/_nanoseconds)
    if (date._seconds) {
      return new Date(date._seconds * 1000);
    }
    // Handle toDate() method (Firestore Timestamp client-side)
    if (date.toDate) {
      return date.toDate();
    }
    // Handle ISO string or Date object
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleViewRevision = (e) => {
    e.stopPropagation();
    if (revision) {
      window.open(`/revision/${revision.id}`, '_blank');
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default: Navigate to notes/problem view page
      window.open(`/problem/${problem.id}`, '_blank');
    }
  };

  const statusColors = {
    Todo: 'bg-dark-800 text-dark-400 border-dark-700',
    Solved: 'bg-green-500/10 text-green-400 border-green-500/20',
    Revision: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  };

  return (
    <div 
      className="group bg-dark-900/60 backdrop-blur-md border border-dark-800 rounded-2xl p-6 transition-all duration-500 ease-out hover:scale-[1.1] hover:border-brand-orange hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:-translate-y-1 relative overflow-hidden"
      onClick={handleClick}
    >
      {/* Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange blur-3xl opacity-0 group-hover:opacity-25 transition-opacity" />
      
      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {/* Platform Tag */}
            <div className={`text-[12px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2 ${
              problem.platform === 'LeetCode' ? 'text-yellow-500/80' : 
              problem.platform === 'GeeksforGeeks' ? 'text-green-500/80' : 
              'text-dark-500'
            }`}>
              <span className={`w-1 h-1 rounded-full ${
                problem.platform === 'LeetCode' ? 'bg-yellow-500' : 
                problem.platform === 'GeeksforGeeks' ? 'bg-green-500' : 
                'bg-brand-orange'
              }`} />
              {problem.platform}
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-black text-white group-hover:text-brand-orange transition-colors truncate">
              {problem.title}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Difficulty */}
            <span className={`px-3 py-1.5 text-[12px] font-black uppercase tracking-widest rounded-lg border ${
              problem.difficulty === 'Easy' ? 'bg-[#00b8a3]/10 text-[#00b8a3] border-[#00b8a3]/20' :
              problem.difficulty === 'Medium' ? 'bg-[#ffc01e]/10 text-[#ffc01e] border-[#ffc01e]/20' :
              'bg-[#ff375f]/10 text-[#ff375f] border-[#ff375f]/20'
            }`}>
              {problem.difficulty}
            </span>
            
            {/* Tracking Indicator */}
            {revision && (
               <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-brand-orange bg-brand-orange/5 border border-brand-orange/10 px-2.5 py-1 rounded-md">
                 <Repeat className="w-3.5 h-3.5" />
                 Revision
               </div>
            )}
          </div>
        </div>

        {/* Middle Section: Meta Information */}
        <div className="flex-1 space-y-4">
          {/* Topics & Patterns */}
          <div className="flex flex-wrap gap-2.5">
            {problem.topics?.slice(0, 2).map((topic) => (
              <span key={topic} className="px-3 py-1.5 text-[12px] font-extrabold bg-dark-950 border border-dark-800 text-dark-400 rounded-md">
                {topic}
              </span>
            ))}
            {problem.patterns?.slice(0, 1).map((pattern) => (
              <span key={pattern} className="px-3 py-1.5 text-[12px] font-extrabold bg-blue-500/5 border border-blue-500/10 text-blue-400 rounded-md">
                {pattern}
              </span>
            ))}
          </div>

          {/* Companies with interactive feel */}
          {problem.companies && problem.companies.length > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-dark-950 rounded-lg border border-dark-800">
                <Building2 className="w-4 h-4 text-dark-500" />
              </div>
              <div className="flex items-center gap-1.5 overflow-hidden">
                {problem.companies.slice(0, 3).map((company, idx) => (
                  <span key={idx} className="text-[14px] font-extrabold text-dark-400 whitespace-nowrap">
                    {company}{idx < Math.min(problem.companies.length, 3) - 1 ? ' ·' : ''}
                  </span>
                ))}
                {problem.companies.length > 3 && (
                   <span className="text-[12px] font-extrabold text-dark-600">+{problem.companies.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Timeline */}
        <div className="mt-6 pt-5 border-t border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {problem.solvedAt && parseFirestoreDate(problem.solvedAt) ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-dark-600" />
                <span className="text-[13px] font-extrabold text-dark-500">
                  {parseFirestoreDate(problem.solvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            ) : (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-dark-600" />
                  <span className="text-[13px] font-extrabold text-dark-500 uppercase tracking-wider">Unsolved</span>
                </div>
            )}
          </div>
          
          <div 
             className="w-8 h-8 rounded-full bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center group-hover:bg-brand-orange group-hover:border-brand-orange transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
             onClick={(e) => {
               e.stopPropagation();
               handleClick();
             }}
          >
            <Terminal className="w-4 h-4 text-brand-orange group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemCard;

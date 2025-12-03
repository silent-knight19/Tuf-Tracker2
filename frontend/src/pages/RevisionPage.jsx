import { useEffect } from 'react';
import { useRevisionStore } from '../stores/revisionStore';
import { Check, Calendar } from 'lucide-react';

function RevisionPage() {
  const { dueProblems, upcomingProblems, fetchRevisionQueue, completeRevision, loading } = useRevisionStore();

  useEffect(() => {
    fetchRevisionQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = async (problemId) => {
    await completeRevision(problemId);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && !dueProblems.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-100 mb-2">Revision Queue</h1>
        <p className="text-dark-400">Review problems using spaced repetition</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="text-dark-400 text-sm mb-1">Due Now</div>
          <div className="text-3xl font-bold text-difficulty-hard">{dueProblems.length}</div>
        </div>
        <div className="card">
          <div className="text-dark-400 text-sm mb-1">Upcoming</div>
          <div className="text-3xl font-bold text-dark-100">{upcomingProblems.length}</div>
        </div>
      </div>

      {/* Due Problems */}
      {dueProblems.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-dark-100 mb-4">Due for Revision</h2>
          <div className="space-y-3">
            {dueProblems.map((problem) => (
              <div key={problem.id} className="card card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-dark-100 mb-2">
                      {problem.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {problem.topics?.slice(0, 3).map((topic) => (
                        <span key={topic} className="badge bg-dark-800 text-dark-300 border-dark-700">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-dark-400">
                      Last revised: {problem.revisionDates?.length > 0 
                        ? formatDate(problem.revisionDates[problem.revisionDates.length - 1])
                        : 'Never'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`badge ${
                      problem.difficulty === 'Hard' ? 'badge-hard' :
                      problem.difficulty === 'Medium' ? 'badge-medium' :
                      'badge-easy'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <button
                      onClick={() => handleComplete(problem.id)}
                      className="btn btn-primary text-sm px-3 py-1 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Problems */}
      {upcomingProblems.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-dark-100 mb-4">Upcoming Revisions</h2>
          <div className="space-y-3">
            {upcomingProblems.map((problem) => (
              <div key={problem.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-dark-100 mb-2">
                      {problem.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {problem.patterns?.slice(0, 2).map((pattern) => (
                        <span key={pattern} className="badge bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${
                      problem.difficulty === 'Hard' ? 'badge-hard' :
                      problem.difficulty === 'Medium' ? 'badge-medium' :
                      'badge-easy'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <div className="text-sm text-brand-yellow flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(problem.nextRevision)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {dueProblems.length === 0 && upcomingProblems.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-dark-400 mb-4">No revisions scheduled yet</p>
          <p className="text-dark-500 text-sm">Start adding problems to build your revision queue</p>
        </div>
      )}
    </div>
  );
}

export default RevisionPage;

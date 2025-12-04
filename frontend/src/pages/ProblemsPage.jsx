import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProblemStore } from '../stores/problemStore';
import { useCompanyStore } from '../stores/companyStore';
import { useRevisionStore } from '../stores/revisionStore';
import SolvedProblemsStats from '../components/features/SolvedProblemsStats';
import ProblemCard from '../components/features/ProblemCard';
import AddProblemModal from '../components/features/AddProblemModal';
import { CheckCircle2, Plus } from 'lucide-react';

function ProblemsPage() {
  const navigate = useNavigate();
  const { companyName } = useParams();
  const { problems, loading: problemsLoading, setFilters, clearFilters, addProblem, updateProblem } = useProblemStore();
  const { companyProblems, fetchCompanyProblems, loading: companyLoading } = useCompanyStore();
  const { fetchRevisions } = useRevisionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRevisions();
    if (companyName) {
      fetchCompanyProblems(companyName);
    } else {
      setFilters({ company: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName]);



  const loading = companyName ? companyLoading : problemsLoading;

  const handleAddProblem = async (problemData, initialStatus = 'Todo') => {
    try {
      // If passing just a title string (legacy support if needed) or full object
      const title = typeof problemData === 'string' ? problemData : problemData.title;
      const difficulty = problemData.difficulty || 'Medium';
      const platform = problemData.platform || 'LeetCode';
      const platformUrl = problemData.platformUrl || '';
      const topics = problemData.topics || [];
      const patterns = problemData.patterns || [];

      const newProblem = await addProblem({
        title,
        platform,
        platformUrl,
        difficulty,
        topics,
        patterns,
        status: initialStatus
      });
      return newProblem;
    } catch (error) {
      console.error("Failed to add problem", error);
      return null;
    }
  };

  if (loading && (companyName ? companyProblems.length === 0 : problems.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-100">
          {companyName ? `Problems asked by ${companyName}` : 'Problems'}
        </h1>
        {!companyName && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add Problem
          </button>
        )}
      </div>

      {/* LeetCode Style Stats */}
      <SolvedProblemsStats customProblems={companyName ? companyProblems : null} />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-dark-900 p-4 rounded-lg border border-dark-800">
        <input
          type="text"
          placeholder="Search problems..."
          className="input flex-1 min-w-[200px]"
          onChange={(e) => setFilters({ search: e.target.value })}
        />
        
        <select 
          className="input w-40"
          onChange={(e) => setFilters({ difficulty: e.target.value })}
        >
          <option value="">Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select 
          className="input w-40"
          onChange={(e) => setFilters({ platform: e.target.value })}
        >
          <option value="">Platform</option>
          <option value="LeetCode">LeetCode</option>
          <option value="GeeksforGeeks">GeeksforGeeks</option>
          <option value="CodeForces">CodeForces</option>
        </select>

        <button 
          className="btn btn-ghost text-dark-400 hover:text-dark-100"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      {/* Problem List */}
      <div className="space-y-3">
        {companyName ? (
          // Company View List
          companyProblems.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-dark-400">No problems found for this company.</p>
            </div>
          ) : (

            companyProblems.map((problem, index) => {
              // Check if tracked (and not just ViewOnly)
              const trackedProblem = problems.find(p => p.title === problem.title);
              const isRealTracked = trackedProblem && trackedProblem.status !== 'ViewOnly';

              const mergedProblem = {
                ...problem,
                ...trackedProblem,
                isTracked: isRealTracked,
                onAdd: async () => {
                  if (trackedProblem) {
                     // Promote ViewOnly to Todo
                     await updateProblem(trackedProblem.id, { status: 'Todo' });
                  } else {
                    handleAddProblem(problem, 'Todo');
                  }
                }
              };

              return (
                <div 
                  key={index} 
                  className="cursor-pointer"
                >
                  <ProblemCard 
                    problem={mergedProblem} 
                    onClick={() => {
                      if (trackedProblem) {
                        // Navigate to tracked problem in new tab
                        window.open(`/problem/${trackedProblem.id}`, '_blank');
                      } else {
                        // Pass problem data via localStorage for view-only mode in new tab
                        const localId = Date.now().toString();
                        localStorage.setItem(`view_problem_${localId}`, JSON.stringify(problem));
                        window.open(`/problem/view?localId=${localId}`, '_blank');
                      }
                    }}
                  />
                </div>
              );
            })
          )
        ) : (
          // Standard User Problems List
          problems.filter(p => p.status !== 'ViewOnly').length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-dark-400 mb-4">No problems yet</p>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Your First Problem</button>
            </div>
          ) : (
            problems
              .filter(p => p.status !== 'ViewOnly')
              .map((problem) => (
                <div key={problem.id} className="cursor-pointer">
                  <ProblemCard problem={problem} />
                </div>
              ))
          )
        )}
      </div>

      {/* Add Problem Modal */}
      <AddProblemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default ProblemsPage;

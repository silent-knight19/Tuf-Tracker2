import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProblemStore } from '../stores/problemStore';
import { useCompanyStore } from '../stores/companyStore';
import { useRevisionStore } from '../stores/revisionStore';
import SolvedProblemsStats from '../components/features/SolvedProblemsStats';
import ProblemCard from '../components/features/ProblemCard';
import AddProblemModal from '../components/features/AddProblemModal';
import { CheckCircle2, Plus } from 'lucide-react';
import MotivationalQuote from '../components/ui/MotivationalQuote';

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
    <div className="p-8 max-w-7xl mx-auto space-y-5">
      <MotivationalQuote category="Focus" />

      {/* LeetCode Style Stats */}
      <SolvedProblemsStats 
        customProblems={companyName ? companyProblems : null} 
        onShowAddModal={() => setIsModalOpen(true)}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-dark-900/40 backdrop-blur-md py-3 px-6 rounded-2xl border border-dark-800 shadow-xl">
        <div className="relative flex-1 min-w-[300px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            placeholder="Filter problems by title, topic..."
            className="w-full bg-dark-950 border border-dark-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-dark-600 focus:border-brand-orange/50 focus:outline-none transition-all"
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            className="bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-sm font-bold text-dark-200 focus:border-brand-orange/50 focus:outline-none cursor-pointer hover:bg-dark-900 transition-colors"
            onChange={(e) => setFilters({ difficulty: e.target.value })}
          >
            <option value="">Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select 
            className="bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-sm font-bold text-dark-200 focus:border-brand-orange/50 focus:outline-none cursor-pointer hover:bg-dark-900 transition-colors"
            onChange={(e) => setFilters({ platform: e.target.value })}
          >
            <option value="">Platform</option>
            <option value="LeetCode">LeetCode</option>
            <option value="GeeksforGeeks">GeeksforGeeks</option>
            <option value="CodeForces">CodeForces</option>
          </select>

          <button 
            className="px-4 py-3 text-xs font-black uppercase tracking-widest text-dark-500 hover:text-white transition-colors"
            onClick={clearFilters}
          >
            Reset
          </button>
        </div>
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
            // Debug log for date sorting
            (() => {
              const filtered = problems.filter(p => p.status !== 'ViewOnly');
              console.log('Problems before sorting:', filtered.map(p => ({
                title: p.title,
                solvedAt: p.solvedAt,
                updatedAt: p.updatedAt,
                createdAt: p.createdAt
              })));
              return filtered;
            })()
              .sort((a, b) => {
                // Sort by solvedAt/updatedAt/createdAt in descending order (newest first)
                const getTime = (problem) => {
                  // Priority: solvedAt > updatedAt > createdAt
                  const dateField = problem.solvedAt || problem.updatedAt || problem.createdAt;
                  if (!dateField) return 0;
                  
                  // Handle Firestore Timestamp with _seconds (serialized from backend)
                  if (dateField._seconds) return dateField._seconds * 1000;
                  // Handle Firestore Timestamp with seconds
                  if (dateField.seconds) return dateField.seconds * 1000;
                  // Handle toDate() method (Firestore Timestamp client-side)
                  if (dateField.toDate) return dateField.toDate().getTime();
                  // Handle ISO string or Date object
                  const date = new Date(dateField);
                  return isNaN(date.getTime()) ? 0 : date.getTime();
                };
                
                return getTime(b) - getTime(a); // Descending order (newest first)
              })
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

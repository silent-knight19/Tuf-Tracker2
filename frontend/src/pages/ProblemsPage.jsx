import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProblemStore } from '../stores/problemStore';
import { useCompanyStore } from '../stores/companyStore';
import { useRevisionStore } from '../stores/revisionStore';
import SolvedProblemsStats from '../components/features/SolvedProblemsStats';
import ProblemCard from '../components/features/ProblemCard';
import AddProblemModal from '../components/features/AddProblemModal';
import { CheckCircle2, Plus, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import MotivationalQuote from '../components/ui/MotivationalQuote';

function ProblemsPage() {
  const navigate = useNavigate();
  const { companyName } = useParams();
  const { problems, loading: problemsLoading, fetchProblems, addProblem, updateProblem } = useProblemStore();
  const { companyProblems, fetchCompanyProblems, loading: companyLoading } = useCompanyStore();
  const { fetchRevisions } = useRevisionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Local filter state - completely independent from store
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  const toggleGroup = (patternName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [patternName]: !prev[patternName]
    }));
  };

  useEffect(() => {
    fetchRevisions();
    if (companyName) {
      fetchCompanyProblems(companyName);
    } else {
      fetchProblems(); // Fetch all problems without filters
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName]);

  const loading = companyName ? companyLoading : problemsLoading;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('');
    setPlatformFilter('');
  };

  const hasActiveFilters = searchQuery || difficultyFilter || platformFilter;

  // Helper to get consistent timestamp
  const getTime = (problem) => {
    const dateField = problem.solvedAt || problem.updatedAt || problem.createdAt;
    if (!dateField) return 0;
    if (dateField._seconds) return dateField._seconds * 1000;
    if (dateField.seconds) return dateField.seconds * 1000;
    if (dateField.toDate) return dateField.toDate().getTime();
    const date = new Date(dateField);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  };

  // Memoized filtered and grouped problems
  const { filteredProblems, groupedProblems, totalProblems } = useMemo(() => {
    const sourceProblems = companyName ? companyProblems : problems.filter(p => p.status !== 'ViewOnly');
    const total = sourceProblems.length;

    // Apply filters
    const searchLower = searchQuery.toLowerCase().trim();
    
    const filtered = sourceProblems.filter(problem => {
      // Search filter - check title, topics, and PRIMARY pattern only (to match grouping logic)
      if (searchLower) {
        const titleMatch = problem.title?.toLowerCase().includes(searchLower);
        const topicMatch = problem.topics?.some(t => t.toLowerCase().includes(searchLower));
        // Only search the PRIMARY pattern (patterns[0]) to match how we group problems
        const primaryPattern = problem.patterns && problem.patterns.length > 0 ? problem.patterns[0] : 'General';
        const patternMatch = primaryPattern.toLowerCase().includes(searchLower);
        if (!titleMatch && !topicMatch && !patternMatch) return false;
      }

      // Difficulty filter
      if (difficultyFilter && problem.difficulty !== difficultyFilter) return false;

      // Platform filter
      if (platformFilter && problem.platform !== platformFilter) return false;

      return true;
    });

    // Group by primary pattern (only for non-company view)
    if (!companyName) {
      const groups = {};
      filtered.forEach(problem => {
        const primaryPattern = problem.patterns && problem.patterns.length > 0 ? problem.patterns[0] : 'General';
        
        if (!groups[primaryPattern]) {
          groups[primaryPattern] = {
            name: primaryPattern,
            problems: [],
            latestTimestamp: 0
          };
        }
        groups[primaryPattern].problems.push(problem);
        const ts = getTime(problem);
        if (ts > groups[primaryPattern].latestTimestamp) {
          groups[primaryPattern].latestTimestamp = ts;
        }
      });

      // Sort groups by latest activity
      const sortedGroups = Object.values(groups).sort((a, b) => b.latestTimestamp - a.latestTimestamp);

      // Sort problems within each group
      sortedGroups.forEach(group => {
        group.problems.sort((a, b) => getTime(b) - getTime(a));
      });

      return { filteredProblems: filtered, groupedProblems: sortedGroups, totalProblems: total };
    }

    return { filteredProblems: filtered, groupedProblems: null, totalProblems: total };
  }, [companyName, companyProblems, problems, searchQuery, difficultyFilter, platformFilter]);

  const handleAddProblem = async (problemData, initialStatus = 'Todo') => {
    try {
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

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 bg-dark-900/40 backdrop-blur-md py-3 px-6 rounded-2xl border border-dark-800 shadow-xl">
        <div className="relative flex-1 min-w-[300px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-dark-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            placeholder="Search by title, topic, or pattern..."
            className="w-full bg-dark-950 border border-dark-800 rounded-xl pl-12 pr-10 py-3 text-white placeholder-dark-600 focus:border-brand-orange/50 focus:outline-none transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={difficultyFilter}
            className="bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-sm font-bold text-dark-200 focus:border-brand-orange/50 focus:outline-none cursor-pointer hover:bg-dark-900 transition-colors"
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select 
            value={platformFilter}
            className="bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-sm font-bold text-dark-200 focus:border-brand-orange/50 focus:outline-none cursor-pointer hover:bg-dark-900 transition-colors"
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="">Platform</option>
            <option value="LeetCode">LeetCode</option>
            <option value="GeeksforGeeks">GeeksforGeeks</option>
            <option value="CodeForces">CodeForces</option>
          </select>

          {hasActiveFilters && (
            <button 
              className="px-4 py-3 text-xs font-black uppercase tracking-widest text-brand-orange hover:text-white transition-colors flex items-center gap-2"
              onClick={clearAllFilters}
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-dark-400">
          Showing <span className="text-brand-orange font-bold">{filteredProblems.length}</span> of <span className="font-bold">{totalProblems}</span> problems
        </div>
      )}

      {/* Problem List */}
      <div className="space-y-3">
        {companyName ? (
          // Company View List
          <>
            {totalProblems === 0 && !loading && (
              <div className="card text-center py-12">
                <p className="text-dark-400">No problems found for this company.</p>
              </div>
            )}

            {totalProblems > 0 && filteredProblems.length === 0 && !loading && (
              <div className="card text-center py-12 bg-dark-900/20 border-dashed border-dark-800">
                <p className="text-dark-400">No problems match your search.</p>
                <button 
                  className="text-brand-orange text-sm font-black mt-2 hover:underline" 
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {filteredProblems.map((problem, index) => {
              const trackedProblem = problems.find(p => p.title === problem.title);
              const isRealTracked = trackedProblem && trackedProblem.status !== 'ViewOnly';

              const mergedProblem = {
                ...problem,
                ...trackedProblem,
                isTracked: isRealTracked,
                onAdd: async () => {
                  if (trackedProblem) {
                    await updateProblem(trackedProblem.id, { status: 'Todo' });
                  } else {
                    handleAddProblem(problem, 'Todo');
                  }
                }
              };

              return (
                <div key={index} className="cursor-pointer">
                  <ProblemCard 
                    problem={mergedProblem} 
                    onClick={() => {
                      if (trackedProblem) {
                        window.open(`/problem/${trackedProblem.id}`, '_blank');
                      } else {
                        const localId = Date.now().toString();
                        localStorage.setItem(`view_problem_${localId}`, JSON.stringify(problem));
                        window.open(`/problem/view?localId=${localId}`, '_blank');
                      }
                    }}
                  />
                </div>
              );
            })}
          </>
        ) : (
          // Standard User Problems List with Pattern Groups
          <>
            {totalProblems === 0 && !loading && (
              <div className="card text-center py-12">
                <p className="text-dark-400 mb-4">No problems yet</p>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                  Add Your First Problem
                </button>
              </div>
            )}

            {totalProblems > 0 && filteredProblems.length === 0 && !loading && (
              <div className="card text-center py-12 bg-dark-900/20 border-dashed border-dark-800">
                <p className="text-dark-400">No problems match your search.</p>
                <button 
                  className="text-brand-orange text-sm font-black mt-2 hover:underline" 
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {groupedProblems && groupedProblems.map((group, index) => {
              // Default to expanded only for the first group (index 0)
              const isCollapsed = collapsedGroups[group.name] === undefined ? index !== 0 : collapsedGroups[group.name];
              
              return (
                <div key={group.name} className="space-y-6 pt-4 first:pt-0">
                  <div 
                    className="flex items-center gap-4 group/header cursor-pointer select-none"
                    onClick={() => toggleGroup(group.name)}
                  >
                    <div className="flex items-center gap-3">
                      {isCollapsed ? (
                        <ChevronRight className="w-5 h-5 text-dark-500 group-hover/header:text-brand-orange transition-colors" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-brand-orange" />
                      )}
                      <h2 className="text-2xl font-black text-white/90 tracking-tight flex items-center gap-3">
                        <span className={`w-2 h-8 bg-brand-orange rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-500 ${isCollapsed ? 'scale-y-50 opacity-50' : 'group-hover/header:scale-y-125'}`} />
                        {group.name}
                      </h2>
                    </div>
                    
                    <div className="h-px flex-1 bg-gradient-to-r from-dark-800 to-transparent opacity-50" />
                    
                    <span className="text-xs font-black text-dark-500 uppercase tracking-widest bg-dark-900/50 px-3 py-1 rounded-full border border-dark-800/50">
                      {group.problems.length} {group.problems.length === 1 ? 'Problem' : 'Problems'}
                    </span>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="space-y-4 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                      {group.problems.map((problem) => (
                        <div key={`${group.name}-${problem.id}`} className="cursor-pointer">
                          <ProblemCard problem={problem} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
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

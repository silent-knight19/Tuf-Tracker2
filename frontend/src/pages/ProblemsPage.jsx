import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProblemStore } from '../stores/problemStore';
import { useCompanyStore } from '../stores/companyStore';
import { useRevisionStore } from '../stores/revisionStore';
import SolvedProblemsStats from '../components/features/SolvedProblemsStats';
import ProblemCard from '../components/features/ProblemCard';
import AddProblemModal from '../components/features/AddProblemModal';
import MotivationalQuote from '../components/ui/MotivationalQuote';
import { CheckCircle2, Plus, ChevronDown, ChevronRight, Search, X } from 'lucide-react';

function ProblemsPage() {
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
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-5">
      {/* 21st.dev Style Bento Stats Grid */}
      <SolvedProblemsStats 
        customProblems={companyName ? companyProblems : null} 
        onShowAddModal={() => setIsModalOpen(true)}
      />

      {/* Daily Directive Focus Banner */}
      <MotivationalQuote category="Focus" variant="banner" />

      {/* Search and Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-dark-900/60 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl border border-white/[0.07] shadow-luxe">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-4 h-4 text-dark-400" />
          </div>
          <input
            id="problem-search-input"
            type="text"
            value={searchQuery}
            placeholder="Search problems by title, topic, or pattern..."
            className="w-full bg-dark-950/80 border border-white/[0.08] rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-white placeholder-dark-400 focus:border-brand-orange/50 focus:ring-2 focus:ring-brand-orange/15 focus:outline-none transition-all shadow-inner"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Segmented Controls & Platform */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Difficulty Pills */}
          <div className="flex items-center p-1 rounded-xl bg-dark-950/80 border border-white/[0.08]">
            {[
              { label: 'All', value: '', dot: null },
              { label: 'Easy', value: 'Easy', dot: 'bg-emerald-400' },
              { label: 'Medium', value: 'Medium', dot: 'bg-amber-400' },
              { label: 'Hard', value: 'Hard', dot: 'bg-rose-400' }
            ].map(diff => (
              <button
                key={diff.label}
                onClick={() => setDifficultyFilter(diff.value)}
                className={`px-2.5 py-1 rounded-lg text-2xs font-semibold transition-all flex items-center gap-1.5 ${
                  difficultyFilter === diff.value 
                    ? 'bg-white/[0.1] text-white shadow-sm' 
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                {diff.dot && <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />}
                <span>{diff.label}</span>
              </button>
            ))}
          </div>

          {/* Platform Selector */}
          <select 
            value={platformFilter}
            className="bg-dark-950/80 border border-white/[0.08] rounded-xl px-3 py-1.5 text-2xs font-semibold text-dark-200 focus:border-brand-orange/50 focus:outline-none cursor-pointer hover:bg-dark-900 transition-colors shadow-inner"
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="">All Platforms</option>
            <option value="LeetCode">LeetCode</option>
            <option value="GeeksforGeeks">GeeksforGeeks</option>
            <option value="CodeForces">CodeForces</option>
          </select>

          {hasActiveFilters && (
            <button 
              className="px-2.5 py-1 text-2xs font-semibold text-brand-orange hover:text-white transition-colors flex items-center gap-1 rounded-lg hover:bg-brand-orange/10"
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
        <div className="text-xs text-dark-400 px-1">
          Showing <span className="text-brand-orange font-semibold">{filteredProblems.length}</span> of <span className="font-semibold text-white">{totalProblems}</span> problems
        </div>
      )}

      {/* Problem Cards Presentation */}
      <div className="space-y-8">
        {companyName ? (
          // Company View List
          <>
            {totalProblems === 0 && !loading && (
              <div className="card text-center py-12">
                <p className="text-dark-400">No problems found for this company.</p>
              </div>
            )}

            {totalProblems > 0 && filteredProblems.length === 0 && !loading && (
              <div className="card text-center py-12 bg-dark-900/40 border-dashed border-white/[0.1]">
                <p className="text-dark-400 text-sm">No problems match your current filters.</p>
                <button 
                  className="text-brand-orange text-xs font-semibold mt-2 hover:underline inline-block" 
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div key={index}>
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
            </div>
          </>
        ) : (
          // Standard User Problems Grouped by Patterns in a Grid
          <>
            {totalProblems === 0 && !loading && (
              <div className="card text-center py-16 space-y-4">
                <p className="text-dark-300 font-medium">No problems tracked yet.</p>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                  Add Your First Problem
                </button>
              </div>
            )}

            {totalProblems > 0 && filteredProblems.length === 0 && !loading && (
              <div className="card text-center py-12 bg-dark-900/40 border-dashed border-white/[0.1]">
                <p className="text-dark-400 text-sm">No problems match your search.</p>
                <button 
                  className="text-brand-orange text-xs font-semibold mt-2 hover:underline inline-block" 
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {groupedProblems && groupedProblems.map((group, index) => {
              const isCollapsed = collapsedGroups[group.name] === undefined ? index !== 0 : collapsedGroups[group.name];
              
              return (
                <div key={group.name} className="space-y-4">
                  {/* Refined Section Header */}
                  <div 
                    className="flex items-center justify-between py-1 group/header cursor-pointer select-none"
                    onClick={() => toggleGroup(group.name)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center bg-white/[0.04] text-dark-400 group-hover/header:text-brand-orange group-hover/header:bg-white/[0.08] transition-colors">
                        {isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-brand-orange" />
                        )}
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        {group.name}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-2xs font-semibold text-dark-400 bg-white/[0.03] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
                        {group.problems.length} {group.problems.length === 1 ? 'problem' : 'problems'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Adaptive Responsive Cards Grid */}
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      {group.problems.map((problem) => (
                        <div key={`${group.name}-${problem.id}`}>
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

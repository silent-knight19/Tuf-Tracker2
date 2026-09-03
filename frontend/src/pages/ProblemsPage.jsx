import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProblemStore } from '../stores/problemStore';
import { useCompanyStore } from '../stores/companyStore';
import { useRevisionStore } from '../stores/revisionStore';
import SolvedProblemsStats from '../components/features/SolvedProblemsStats';
import ProblemCard from '../components/features/ProblemCard';
import AddProblemModal from '../components/features/AddProblemModal';
import ProblemRow from '../components/problem/ProblemRow';
import ProblemDetailDrawer from '../components/problem/ProblemDetailDrawer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Tabs from '../components/ui/Tabs';
import Skeleton from '../components/ui/Skeleton';
import Select from '../components/ui/Select';
import {
  Plus,
  Search,
  LayoutList,
  LayoutGrid,
  FilterX,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export default function ProblemsPage() {
  const { companyName } = useParams();
  const {
    problems,
    loading: problemsLoading,
    fetchProblems,
    addProblem,
    updateProblem,
  } = useProblemStore();
  const { companyProblems, fetchCompanyProblems, loading: companyLoading } =
    useCompanyStore();
  const { revisions, fetchRevisions, createRevision } = useRevisionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');

  const toggleGroup = (patternName) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [patternName]: !prev[patternName],
    }));
  };

  useEffect(() => {
    fetchRevisions();
    if (companyName) {
      fetchCompanyProblems(companyName);
    } else {
      fetchProblems();
    }
  }, [companyName, fetchProblems, fetchCompanyProblems, fetchRevisions]);

  const loading = companyName ? companyLoading : problemsLoading;

  const clearAllFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('All');
    setStatusFilter('All');
    setPlatformFilter('All');
  };

  const hasActiveFilters =
    searchQuery ||
    difficultyFilter !== 'All' ||
    statusFilter !== 'All' ||
    platformFilter !== 'All';

  // Map revisions by problemId for fast lookup
  const revisionMap = useMemo(() => {
    const map = {};
    (revisions || []).forEach((r) => {
      if (r.problemId) map[r.problemId] = r;
      if (r.problemTitle) map[r.problemTitle.toLowerCase()] = r;
    });
    return map;
  }, [revisions]);

  // Filtered & Grouped Problems
  const { filteredProblems, groupedProblems, totalCount } = useMemo(() => {
    const sourceProblems = companyName
      ? companyProblems
      : problems.filter((p) => p.status !== 'ViewOnly');
    const total = sourceProblems.length;
    const q = searchQuery.toLowerCase().trim();

    const filtered = sourceProblems.filter((problem) => {
      // Search
      if (q) {
        const titleMatch = problem.title?.toLowerCase().includes(q);
        const topicMatch = problem.topics?.some((t) => t.toLowerCase().includes(q));
        const patternMatch = problem.patterns?.some((pat) => pat.toLowerCase().includes(q));
        const companyMatch = problem.companies?.some((c) => c.toLowerCase().includes(q));
        if (!titleMatch && !topicMatch && !patternMatch && !companyMatch) return false;
      }

      // Difficulty
      if (difficultyFilter !== 'All' && problem.difficulty !== difficultyFilter) {
        return false;
      }

      // Status
      const isSolved =
        problem.status === 'Solved' ||
        problem.status === 'Completed' ||
        Boolean(problem.solvedAt);

      if (statusFilter === 'Solved' && !isSolved) return false;
      if (statusFilter === 'Unsolved' && isSolved) return false;

      // Platform
      if (platformFilter !== 'All' && problem.platform !== platformFilter) {
        return false;
      }

      return true;
    });

    // Grouping for grid view
    const groups = {};
    filtered.forEach((p) => {
      const pattern = p.patterns?.[0] || 'General Algorithms';
      if (!groups[pattern]) {
        groups[pattern] = { name: pattern, problems: [] };
      }
      groups[pattern].problems.push(p);
    });

    return {
      filteredProblems: filtered,
      groupedProblems: Object.values(groups),
      totalCount: total,
    };
  }, [
    companyName,
    companyProblems,
    problems,
    searchQuery,
    difficultyFilter,
    statusFilter,
    platformFilter,
  ]);

  const handleAddProblem = async (problemData, initialStatus = 'Todo') => {
    try {
      const newProblem = await addProblem({
        ...problemData,
        status: initialStatus,
      });
      return newProblem;
    } catch (error) {
      console.error('Failed to add problem', error);
      return null;
    }
  };

  const handlePreviewProblem = (problem) => {
    setSelectedProblem(problem);
    setIsDrawerOpen(true);
  };

  const handleAddToRevision = async (problem) => {
    if (!problem) return;
    try {
      await createRevision({
        problemId: problem.id,
        problemTitle: problem.title,
        difficulty: problem.difficulty,
        notes: '',
        status: 'active',
      });
      fetchRevisions();
    } catch (err) {
      console.error('Failed to queue revision', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* 1. Statistics Banner */}
      <SolvedProblemsStats
        customProblems={companyName ? companyProblems : null}
        onShowAddModal={() => setIsModalOpen(true)}
      />

      {/* 2. Faceted Filter & Control Toolbar */}
      <div className="bg-surface-raised/80 border border-border rounded-xl p-3 shadow-inner-rim space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <Input
              id="problem-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search problem title, pattern, topic, company..."
              icon={Search}
              shortcut="⌘K"
              size="sm"
            />
          </div>

          {/* Right Controls: View Switcher & Add Button */}
          <div className="flex items-center gap-2.5">
            {/* View Switcher */}
            <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-surface-raised text-foreground shadow-sm'
                    : 'text-foreground-subtle hover:text-foreground'
                }`}
                title="Dense table view"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-surface-raised text-foreground shadow-sm'
                    : 'text-foreground-subtle hover:text-foreground'
                }`}
                title="Pattern bento grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={Plus}
            >
              Add Problem
            </Button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-border-subtle">
          <div className="flex flex-wrap items-center gap-3">
            {/* Difficulty Tabs */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-foreground-subtle text-[11px] font-semibold mr-1">
                Difficulty:
              </span>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    difficultyFilter === diff
                      ? 'bg-surface text-foreground border border-border font-semibold shadow-sm'
                      : 'text-foreground-subtle hover:text-foreground'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-foreground-subtle text-[11px] font-semibold mr-1">
                Status:
              </span>
              {['All', 'Solved', 'Unsolved'].map((stat) => (
                <button
                  key={stat}
                  type="button"
                  onClick={() => setStatusFilter(stat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    statusFilter === stat
                      ? 'bg-surface text-foreground border border-border font-semibold shadow-sm'
                      : 'text-foreground-subtle hover:text-foreground'
                  }`}
                >
                  {stat}
                </button>
              ))}
            </div>

            {/* Platform Select */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-foreground-subtle text-[11px] font-semibold">
                Platform:
              </span>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="bg-surface border border-border rounded-md px-2 py-1 text-[11px] text-foreground outline-none cursor-pointer"
              >
                <option value="All">All Platforms</option>
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
                <option value="Codeforces">Codeforces</option>
                <option value="TakeUForward">TakeUForward</option>
              </select>
            </div>
          </div>

          {/* Active Filter Clear */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              <FilterX className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Problem List Content */}
      {loading && filteredProblems.length === 0 ? (
        <div className="space-y-2">
          <Skeleton variant="row" count={8} />
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-surface-raised/30 p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto text-foreground-subtle">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No problems found</h3>
          <p className="text-xs text-foreground-subtle max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No problems match your current search and filter criteria. Try clearing filters.'
              : 'You have not added any problems to this bank yet.'}
          </p>
          {hasActiveFilters ? (
            <Button size="sm" variant="secondary" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              leftIcon={Plus}
            >
              Add First Problem
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Linear-Style Table View */
        <div className="rounded-xl border border-border bg-surface-raised/40 overflow-hidden shadow-inner-rim">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface text-foreground-subtle uppercase text-[10px] font-semibold tracking-wider select-none">
                  <th className="py-3 px-4 w-10 text-center">Status</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4 w-28">Difficulty</th>
                  <th className="py-3 px-4 min-w-[180px]">Pattern & Topics</th>
                  <th className="py-3 px-4 w-24">Platform</th>
                  <th className="py-3 px-4 w-28">Revision</th>
                  <th className="py-3 px-4 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredProblems.map((problem) => (
                  <ProblemRow
                    key={problem.id}
                    problem={problem}
                    onPreview={handlePreviewProblem}
                    revision={
                      revisionMap[problem.id] ||
                      revisionMap[problem.title?.toLowerCase()]
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-border-subtle bg-surface/60 flex items-center justify-between text-[11px] text-foreground-subtle">
            <span>
              Showing <strong className="text-foreground">{filteredProblems.length}</strong> of{' '}
              {totalCount} problems
            </span>
            <span>Click any row to inspect details</span>
          </div>
        </div>
      ) : (
        /* Pattern Bento Grid View */
        <div className="space-y-4">
          {groupedProblems.map((group) => {
            const isCollapsed = Boolean(collapsedGroups[group.name]);
            return (
              <div
                key={group.name}
                className="rounded-xl border border-border bg-surface-raised/40 overflow-hidden shadow-inner-rim"
              >
                {/* Accordion Group Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.name)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-hover/60 transition-colors border-b border-border text-left select-none"
                >
                  <div className="flex items-center gap-2.5">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-foreground-subtle" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-foreground-subtle" />
                    )}
                    <h3 className="text-xs font-bold text-foreground tracking-tight">
                      {group.name}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-raised border border-border text-foreground-subtle">
                      {group.problems.length}
                    </span>
                  </div>
                </button>

                {/* Grid Cards */}
                {!isCollapsed && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.problems.map((problem) => (
                      <ProblemCard
                        key={problem.id}
                        problem={problem}
                        onUpdate={updateProblem}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Slide-Over Detail Drawer */}
      <ProblemDetailDrawer
        problem={selectedProblem}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        revision={
          selectedProblem
            ? revisionMap[selectedProblem.id] ||
              revisionMap[selectedProblem.title?.toLowerCase()]
            : null
        }
        onAddToRevision={handleAddToRevision}
      />

      {/* 5. Add Problem Modal */}
      <AddProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProblem}
      />
    </div>
  );
}

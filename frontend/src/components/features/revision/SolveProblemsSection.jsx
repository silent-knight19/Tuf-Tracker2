import { useState, useMemo, useEffect } from 'react';
import { Search, Code, Filter, LayoutGrid, List as ListIcon, Star, Clock, Tags, ChevronDown, ChevronRight, ExternalLink, X, ArrowRight, Layers, Target, ShieldCheck, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRevisionStore } from '../../../stores/revisionStore';

function SolveProblemsSection() {
  const { revisions } = useRevisionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [expandedGroups, setExpandedGroups] = useState({});

  const { filteredRevisions, groupedRevisions, totalCount } = useMemo(() => {
    // 1. Deduplicate: Use problemId as primary key, only use title for problems with actual titles
    const seenProblemIds = new Set();
    const seenTitleKeys = new Set();
    
    const uniqueRevisions = revisions.filter(r => {
      // STRICT FILTER: If it doesn't have a valid title, hide it.
      const title = r.problemTitle?.trim();
      if (!title || title.toLowerCase() === 'untitled problem') {
        return false; 
      }
      
      // Primary deduplication: by problemId (most reliable)
      if (r.problemId) {
        if (seenProblemIds.has(r.problemId)) return false;
        seenProblemIds.add(r.problemId);
        return true;
      }
      
      // Secondary: by title+platform for problems with actual titles
      const titleKey = `${title.toLowerCase()}-${r.platform || 'LeetCode'}`;
      if (seenTitleKeys.has(titleKey)) return false;
      seenTitleKeys.add(titleKey);
      return true;
    });

    const searchLower = searchQuery.toLowerCase().trim();
    
    // 2. Filter
    const filtered = uniqueRevisions.filter(revision => {
      // Difficulty filter
      if (difficultyFilter !== 'All' && revision.difficulty !== difficultyFilter) return false;
      
      // Search filter
      if (searchLower) {
        const titleMatch = (revision.problemTitle || 'Untitled Problem').toLowerCase().includes(searchLower);
        const topicMatch = revision.topics?.some(t => t.toLowerCase().includes(searchLower));
        const patternMatch = revision.patterns?.some(p => p.toLowerCase().includes(searchLower)) || 
                           (revision.pattern && revision.pattern.toLowerCase().includes(searchLower));
        
        return titleMatch || topicMatch || patternMatch;
      }
      
      return true;
    });

    // 3. Group by Pattern
    const groups = {};
    filtered.forEach(revision => {
      const pattern = revision.pattern || (revision.patterns && revision.patterns[0]) || 'General';
      if (!groups[pattern]) {
        groups[pattern] = {
          name: pattern,
          problems: [],
          lastActivity: null
        };
      }
      groups[pattern].problems.push(revision);
      
      const activityDate = new Date(revision.updatedAt || revision.createdAt || 0);
      if (!groups[pattern].lastActivity || activityDate > groups[pattern].lastActivity) {
        groups[pattern].lastActivity = activityDate;
      }
    });

    // 4. Sort Groups & Problems
    const sortedGroups = Object.values(groups).sort((a, b) => {
      if (a.name === 'General') return 1;
      if (b.name === 'General') return -1;
      return (b.lastActivity || 0) - (a.lastActivity || 0);
    });

    sortedGroups.forEach(group => {
      group.problems.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
    });

    return {
      filteredRevisions: filtered,
      groupedRevisions: sortedGroups,
      totalCount: uniqueRevisions.length
    };
  }, [revisions, searchQuery, difficultyFilter]);

  // Handle initialization of expanded state
  useEffect(() => {
    if (Object.keys(expandedGroups).length === 0 && groupedRevisions.length > 0) {
      if (searchQuery) {
        // Expand all when searching
        const allExpanded = {};
        groupedRevisions.forEach(g => allExpanded[g.name] = true);
        setExpandedGroups(allExpanded);
      } else {
        // Expand first by default
        setExpandedGroups({ [groupedRevisions[0].name]: true });
      }
    }
  }, [groupedRevisions, searchQuery, expandedGroups]);

  const toggleGroup = (name) => {
    setExpandedGroups(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('All');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Floating Navigation Bar */}
      <div className="px-8 py-4 shrink-0 z-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 px-5 py-3 bg-dark-900/60 backdrop-blur-3xl border border-dark-800/80 rounded-2xl shadow-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 group-focus-within:text-brand-orange transition-colors" />
            <input 
              type="text"
              placeholder="Search across your vault..."
              className="w-full bg-dark-950/50 border border-dark-800 rounded-xl py-2 pl-10 pr-10 text-base text-white focus:outline-none focus:border-brand-orange/50 focus:ring-4 focus:ring-brand-orange/5 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-dark-800 rounded-lg text-dark-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 p-1 bg-dark-950/50 border border-dark-800 rounded-xl">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  difficultyFilter === diff 
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                    : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-dark-950/50 border border-dark-800 rounded-xl">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-dark-800 text-white shadow-inner' : 'text-dark-500 hover:text-white hover:bg-dark-800/30'}`}
            >
              <ListIcon className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-dark-800 text-white shadow-inner' : 'text-dark-500 hover:text-white hover:bg-dark-800/30'}`}
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Status Line */}
        <AnimatePresence>
          {(searchQuery || difficultyFilter !== 'All') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between mt-6 px-12"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                <span className="text-base font-medium text-dark-300">
                   Vault filtered to <span className="text-white font-black">{filteredRevisions.length}</span> artifacts
                </span>
              </div>
              <button 
                onClick={clearFilters}
                className="text-[11px] font-black text-brand-orange uppercase tracking-[0.2em] hover:text-orange-400 transition-colors flex items-center gap-2"
              >
                Recalibrate Signals <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grouped Contents Feed */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto space-y-4"
        >
          {groupedRevisions.map((group, groupIdx) => (
            <div key={group.name} className="group/panel">
              {/* Premium Expansion Panel Header */}
              <button 
                onClick={() => toggleGroup(group.name)}
                className={`w-full flex items-center justify-between p-5 bg-dark-900/40 backdrop-blur-3xl border rounded-2xl transition-all duration-700 select-none group-hover/panel:bg-dark-900/60 ${
                  expandedGroups[group.name] 
                    ? 'border-brand-orange/30 shadow-[0_0_40px_rgba(249,115,22,0.1)] ring-1 ring-brand-orange/10' 
                    : 'border-dark-800/60 hover:border-dark-700'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl border transition-all duration-700 flex items-center justify-center relative overflow-hidden ${
                    expandedGroups[group.name]
                      ? 'bg-brand-orange/10 border-brand-orange/30 shadow-inner'
                      : 'bg-dark-950 border-dark-800'
                  }`}>
                    {expandedGroups[group.name] && (
                      <motion.div 
                        layoutId={`bg-${group.name}`}
                        className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-transparent"
                      />
                    )}
                    <Layers className={`w-5 h-5 relative z-10 transition-all duration-700 ${
                      expandedGroups[group.name] ? 'text-brand-orange scale-110' : 'text-dark-500 group-hover/panel:text-dark-300'
                    }`} />
                  </div>
                  
                  <div className="text-left space-y-0.5">
                    <h3 className={`text-2xl font-black transition-all duration-700 ${expandedGroups[group.name] ? 'text-white translate-x-1' : 'text-dark-400 group-hover/panel:text-dark-200'}`}>
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-dark-950 rounded-full border border-dark-800/60">
                         <div className={`w-1 h-1 rounded-full ${expandedGroups[group.name] ? 'bg-brand-orange' : 'bg-dark-700'}`} />
                         <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">{group.problems.length} Units</span>
                      </div>
                      <span className="text-[10px] font-black text-dark-600 uppercase tracking-widest leading-none">
                        Activity: {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(group.lastActivity)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={`w-8 h-8 rounded-full border border-dark-800 flex items-center justify-center transition-all duration-700 shadow-inner ${
                  expandedGroups[group.name] ? 'rotate-180 bg-dark-800/80 border-brand-orange/30' : 'group-hover/panel:border-dark-600'
                }`}>
                  <ChevronDown className={`w-4 h-4 ${expandedGroups[group.name] ? 'text-brand-orange' : 'text-dark-600'}`} />
                </div>
              </button>

              {/* Expansion Content */}
              <AnimatePresence>
                {expandedGroups[group.name] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: -20 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className={`p-5 grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                      {group.problems.map((revision, idx) => (
                        <ProblemBankCard key={revision.id || idx} revision={revision} viewMode={viewMode} index={idx} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {groupedRevisions.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 flex flex-col items-center justify-center text-center space-y-8 bg-dark-900/10 rounded-[4rem] border border-dark-800/20 backdrop-blur-3xl shadow-inner"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-brand-orange/20 blur-3xl rounded-full" />
                <div className="relative p-10 bg-dark-950 border border-dark-800 rounded-[2.5rem] shadow-2xl">
                  <ShieldCheck className="w-16 h-16 text-dark-700" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-5xl font-black text-white tracking-tighter">Vault Empty</h3>
                <p className="text-xl font-medium text-dark-400 max-w-sm leading-relaxed">
                  No encrypted data matches your current search filters.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="px-10 py-5 bg-brand-orange text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-brand-orange/30 hover:scale-110 active:scale-95 transition-all duration-500 hover:rotate-2"
              >
                Scan All Sectors
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Redesigned Problem Card
function ProblemBankCard({ revision, viewMode, index }) {
  const difficultyColors = {
    Easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  const handleStart = (e) => {
    e.stopPropagation();
    // Navigate to the solving experience using problemId
    window.open(`/solve/${revision.problemId}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, x: 1 }}
      className={`group relative bg-dark-950/40 backdrop-blur-3xl border border-dark-800 rounded-2xl p-5 hover:border-brand-orange/40 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] transition-all duration-700 cursor-pointer overflow-hidden ${
        viewMode === 'list' ? 'flex items-center justify-between gap-6' : 'h-full flex flex-col justify-between'
      }`}
      onClick={() => window.open(`/solve/${revision.problemId}`, '_blank')}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-yellow/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className={`flex gap-4 ${viewMode === 'grid' ? 'flex-col items-start' : 'items-center flex-1 min-w-0'}`}>
        <div className="w-11 h-11 rounded-xl bg-dark-950 border border-dark-800 flex items-center justify-center text-dark-500 group-hover:text-brand-orange group-hover:border-brand-orange/30 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 flex-shrink-0">
          <Code className="w-5 h-5 drop-shadow-[0_0_8px_rgba(249,115,22,0)] group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] transition-all" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-md border ${difficultyColors[revision.difficulty]}`}>
              {revision.difficulty}
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-dark-950 rounded-md border border-dark-800/80">
               <span className="text-[10px] font-black text-dark-400 uppercase tracking-widest">{revision.platform || 'LeetCode'}</span>
            </div>
          </div>
          
          <h4 className="text-xl font-black text-white leading-tight group-hover:text-brand-orange transition-colors tracking-tight line-clamp-1">
            {revision.problemTitle}
          </h4>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {revision.topics?.slice(0, 3).map((topic, i) => (
              <span key={i} className="text-[9px] font-black text-dark-500 uppercase tracking-widest px-2 py-1 bg-dark-950 rounded-lg border border-dark-800 group-hover:border-dark-700 group-hover:text-dark-300 transition-all">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={`flex items-center gap-6 ${viewMode === 'grid' ? 'mt-6 pt-5 border-t border-dark-800/40 justify-between w-full' : 'shrink-0'}`}>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-dark-600 uppercase tracking-[0.2em] mb-0.5">Last Sync</span>
          <span className="text-base font-black text-white">
            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(revision.updatedAt || revision.createdAt))}
          </span>
        </div>
        
        <button 
          onClick={handleStart}
          className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl border border-brand-orange/20 hover:bg-brand-orange hover:text-white transition-all duration-700 shadow-2xl shadow-brand-orange/5 hover:shadow-brand-orange/30 group-hover:scale-110 group-hover:-rotate-3 active:scale-90 relative overflow-hidden flex items-center justify-center shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Terminal className="w-4 h-4 relative z-10" />
        </button>
      </div>
    </motion.div>
  );
}

// Stub for Icon
function RefreshCw(props) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export default SolveProblemsSection;

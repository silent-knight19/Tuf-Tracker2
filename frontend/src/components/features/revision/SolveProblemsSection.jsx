import { useState, useMemo } from 'react';
import { Search, Code, Filter, LayoutGrid, List as ListIcon, Star, Clock, Tags } from 'lucide-react';
import { useRevisionStore } from '../../../stores/revisionStore';

function SolveProblemsSection() {
  const { revisions } = useRevisionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const filteredRevisions = useMemo(() => {
    // 1. Deduplicate to prevent showing same problem multiple times
    const seenIds = new Set();
    const seenTitles = new Set();
    const uniqueRevisions = revisions.filter(r => {
      // Priority 1: problemId
      if (r.problemId) {
        if (seenIds.has(r.problemId)) return false;
        seenIds.add(r.problemId);
        // Also track title to avoid double-deduplication if problemId matches
        if (r.problemTitle) seenTitles.add(`${r.problemTitle}-${r.platform || 'LeetCode'}`);
        return true;
      }
      
      // Priority 2: Title + Platform (fallback for missing problemId)
      if (r.problemTitle) {
        const titleKey = `${r.problemTitle}-${r.platform || 'LeetCode'}`;
        if (seenTitles.has(titleKey)) return false;
        seenTitles.add(titleKey);
        return true;
      }
      
      return true; // Keep if no ID or Title (shouldn't happen)
    });

    let result = uniqueRevisions;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(revision => 
        revision.problemTitle?.toLowerCase().includes(query) ||
        revision.topics?.some(topic => topic.toLowerCase().includes(query)) ||
        revision.patterns?.some(pattern => pattern.toLowerCase().includes(query)) ||
        revision.pattern?.toLowerCase().includes(query)
      );
    }

    if (difficultyFilter !== 'All') {
      result = result.filter(r => r.difficulty === difficultyFilter);
    }

    return result;
  }, [revisions, searchQuery, difficultyFilter]);

  const getDisplayCategory = (revision) => {
    // 1. Check explicit patterns
    if (revision.patterns?.[0]) return revision.patterns[0];
    if (revision.pattern) return revision.pattern;
    
    // 2. Check explicit topics
    if (revision.topics?.[0]) return revision.topics[0];
    
    // 3. Smart inference from title if empty
    const title = (revision.problemTitle || '').toLowerCase();
    if (title.includes('sliding window')) return 'Sliding Window';
    if (title.includes('two pointer')) return 'Two Pointers';
    if (title.includes('binary search')) return 'Binary Search';
    if (title.includes('dynamic programming') || title.includes(' dp ')) return 'Dynamic Programming';
    if (title.includes('graph') || title.includes('bfs') || title.includes('dfs')) return 'Graphs';
    if (title.includes('tree') || title.includes('binary tree')) return 'Trees';
    
    return 'Uncategorized';
  };

  const handleProblemClick = (revision) => {
    window.open(`/solve/${revision.id}`, '_blank');
  };

  const difficultyColors = {
    Easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Top Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-dark-900/50 py-2 px-4 rounded-2xl border border-dark-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your collection..."
            className="w-full bg-dark-950 border border-dark-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-dark-600 focus:border-brand-orange/50 focus:outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-dark-950 border border-dark-800 rounded-xl p-1">
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  difficultyFilter === diff 
                    ? 'bg-dark-800 text-white shadow-sm' 
                    : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="flex bg-dark-950 border border-dark-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-dark-800 text-brand-orange' : 'text-dark-500 hover:text-dark-300'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-dark-800 text-brand-orange' : 'text-dark-500 hover:text-dark-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        {filteredRevisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-dark-600" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No matching problems</h3>
            <p className="text-dark-500 max-w-xs">
              Try adjusting your filters or search query to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8' 
              : 'space-y-3 pb-8'}
          `}>
            {filteredRevisions.map(revision => (
              <div
                key={revision.id}
                onClick={() => handleProblemClick(revision)}
                className={`
                  group transition-all duration-300 cursor-pointer
                  ${viewMode === 'grid' 
                    ? 'bg-dark-900 border border-dark-800 rounded-2xl p-6 hover:border-brand-orange/40 hover:shadow-2xl hover:shadow-brand-orange/5' 
                    : 'flex items-center gap-4 bg-dark-950/50 border border-dark-800/60 rounded-xl p-4 hover:bg-dark-800/40 hover:border-brand-orange/30'}
                `}
              >
                {/* Icon/Visual Element */}
                <div className={`
                  flex-shrink-0 flex items-center justify-center rounded-xl bg-dark-800 transition-colors group-hover:bg-brand-orange/10
                  ${viewMode === 'grid' ? 'w-12 h-12 mb-4' : 'w-10 h-10'}
                `}>
                  <Code className={`w-5 h-5 transition-transform group-hover:scale-110 ${viewMode === 'grid' ? 'text-brand-orange' : 'text-dark-500 group-hover:text-brand-orange'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`flex items-start justify-between gap-3 ${viewMode === 'grid' ? 'flex-col sm:flex-row' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-white group-hover:text-brand-orange transition-colors truncate">
                        {revision.problemTitle || 'Untitled Problem'}
                      </h4>
                      
                      {/* Meta info for list view */}
                      {viewMode === 'list' && (
                        <div className="flex items-center gap-3 mt-2">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                            <Tags className="w-3 h-3" />
                            {getDisplayCategory(revision)}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-dark-600">
                             <Clock className="w-3 h-3" />
                             Added {new Date(revision.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                      difficultyColors[revision.difficulty] || difficultyColors.Medium
                    }`}>
                      {revision.difficulty || 'Medium'}
                    </span>
                  </div>
                  
                  {/* Expanded tags for grid view */}
                  {viewMode === 'grid' && (
                    <div className="mt-6 flex flex-wrap gap-2">
                       {(revision.patterns || []).slice(0, 2).map((pattern, idx) => (
                        <span key={idx} className="px-2 py-1 text-[10px] font-bold bg-blue-500/5 text-blue-400 border border-blue-500/10 rounded-md">
                          {pattern}
                        </span>
                      ))}
                      {(revision.topics || []).slice(0, 1).map((topic, idx) => (
                        <span key={idx} className="px-2 py-1 text-[10px] font-bold bg-purple-500/5 text-purple-400 border border-purple-500/10 rounded-md">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SolveProblemsSection;

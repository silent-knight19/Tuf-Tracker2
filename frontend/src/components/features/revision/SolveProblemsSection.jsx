import { useState, useMemo } from 'react';
import { Search, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { useRevisionStore } from '../../../stores/revisionStore';

function SolveProblemsSection() {
  const { revisions } = useRevisionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter revisions based on search query (name, topic, pattern)
  const filteredRevisions = useMemo(() => {
    if (!searchQuery.trim()) return revisions;
    
    const query = searchQuery.toLowerCase().trim();
    return revisions.filter(revision => {
      // Match by problem title
      const titleMatch = revision.problemTitle?.toLowerCase().includes(query);
      
      // Match by topics
      const topicsMatch = revision.topics?.some(topic => 
        topic.toLowerCase().includes(query)
      );
      
      // Match by patterns
      const patternsMatch = revision.patterns?.some(pattern => 
        pattern.toLowerCase().includes(query)
      );
      
      // Match by pattern (single field)
      const patternMatch = revision.pattern?.toLowerCase().includes(query);
      
      return titleMatch || topicsMatch || patternsMatch || patternMatch;
    });
  }, [revisions, searchQuery]);

  const handleProblemClick = (revision) => {
    // Open in new browser tab
    window.open(`/solve/${revision.id}`, '_blank');
  };

  const difficultyColors = {
    Easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  return (
    <div className="card bg-dark-900 border-dark-800 p-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-brand-orange" />
          Solve Problems
          <span className="text-sm text-dark-400 font-normal">({revisions.length})</span>
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-dark-400 group-hover:text-white transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-dark-400 group-hover:text-white transition-colors" />
        )}
      </button>

      {isExpanded && (
        <>
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, topic, or pattern..."
              className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-dark-500 focus:border-brand-orange focus:outline-none transition-colors text-sm"
            />
          </div>

          {/* Problems List */}
          {filteredRevisions.length === 0 ? (
            <div className="text-center py-8 text-dark-400">
              {searchQuery ? (
                <p>No problems match your search.</p>
              ) : (
                <p>No problems in your revision queue yet.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
              {filteredRevisions.map(revision => (
                <div
                  key={revision.id}
                  onClick={() => handleProblemClick(revision)}
                  className="p-3 bg-dark-950 border border-dark-700 rounded-lg hover:border-brand-orange/50 hover:bg-dark-800/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white group-hover:text-brand-orange transition-colors truncate">
                        {revision.problemTitle || 'Untitled Problem'}
                      </h4>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {revision.patterns?.slice(0, 2).map((pattern, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded"
                          >
                            {pattern}
                          </span>
                        ))}
                        {revision.pattern && !revision.patterns?.includes(revision.pattern) && (
                          <span className="px-1.5 py-0.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                            {revision.pattern}
                          </span>
                        )}
                        {revision.topics?.slice(0, 2).map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border shrink-0 ${
                      difficultyColors[revision.difficulty] || difficultyColors.Medium
                    }`}>
                      {revision.difficulty || 'Medium'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SolveProblemsSection;

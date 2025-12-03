import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function PatternProgressList() {
  const [isExpanded, setIsExpanded] = useState(true);

  // Mock data - in real app, fetch from store
  const patterns = [
    { name: 'Two Pointers', total: 12, mastered: 4 },
    { name: 'Sliding Window', total: 8, mastered: 2 },
    { name: 'Binary Search', total: 15, mastered: 8 },
    { name: 'Dynamic Programming', total: 20, mastered: 5 },
  ];

  return (
    <div className="card bg-dark-900 border-dark-800 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-dark-800/50 transition-colors"
      >
        <span className="text-base font-bold text-dark-400 uppercase tracking-wider">Pattern Mastery</span>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-dark-400" /> : <ChevronDown className="w-5 h-5 text-dark-400" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {patterns.map(pattern => (
            <div key={pattern.name} className="group cursor-pointer">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white font-medium group-hover:text-brand-orange transition-colors">{pattern.name}</span>
                <span className="text-dark-400">{Math.round((pattern.mastered / pattern.total) * 100)}%</span>
              </div>
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-orange/80 rounded-full transition-all duration-500 group-hover:bg-brand-orange"
                  style={{ width: `${(pattern.mastered / pattern.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <button className="w-full text-center text-sm text-dark-400 hover:text-white mt-2 py-1">
            View All Patterns
          </button>
        </div>
      )}
    </div>
  );
}

export default PatternProgressList;

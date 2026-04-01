import { useState, useEffect } from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  LayoutGrid,
  BarChart3
} from 'lucide-react';
import { neetcode150Categories, getNeetcode150Stats } from '../data/neetcode150';
import SheetProblemModal from '../components/features/sheets/SheetProblemModal';

function Neetcode150Page() {
  const [expandedCategories, setExpandedCategories] = useState(new Set(['arrays-hashing']));
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [sortMode, setSortMode] = useState('category'); // 'category' or 'difficulty'
  const [solvedProblems, setSolvedProblems] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('neetcode150-solved');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const stats = getNeetcode150Stats();

  // Save to localStorage whenever solvedProblems changes
  useEffect(() => {
    localStorage.setItem('neetcode150-solved', JSON.stringify([...solvedProblems]));
  }, [solvedProblems]);

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-dark-400 bg-dark-400/10 border-dark-400/20';
    }
  };

  const toggleSolved = (problemId, e) => {
    e?.stopPropagation();
    const newSolved = new Set(solvedProblems);
    if (newSolved.has(problemId)) {
      newSolved.delete(problemId);
    } else {
      newSolved.add(problemId);
    }
    setSolvedProblems(newSolved);
  };

  const progress = Math.round((solvedProblems.size / stats.total) * 100);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7d72c7] to-[#9b8fd4] flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/neetcode-io-logo.png" alt="NeetCode" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">NeetCode 150</h1>
            <p className="text-dark-400">The gold standard for coding interview preparation</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-white">{stats.total}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Total Problems</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-green-400">{stats.easy}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Easy</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-yellow-400">{stats.medium}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Medium</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-red-400">{stats.hard}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Hard</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-brand-orange">{stats.blind}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Blind 75</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-[#a396d6]">{stats.categories}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Categories</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-dark-300">Your Progress</span>
            <span className="text-sm font-black text-brand-orange">{solvedProblems.size} / {stats.total} ({progress}%)</span>
          </div>
          <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 mt-6 mb-4">
          <span className="text-sm text-dark-400 font-medium">Sort by:</span>
          <div className="flex bg-dark-900/50 border border-dark-800 rounded-lg p-1">
            <button
              onClick={() => setSortMode('category')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                sortMode === 'category' 
                  ? 'bg-[#7d72c7]/20 text-[#a396d6] border border-[#7d72c7]/30' 
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Topics
            </button>
            <button
              onClick={() => setSortMode('difficulty')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                sortMode === 'difficulty' 
                  ? 'bg-[#7d72c7]/20 text-[#a396d6] border border-[#7d72c7]/30' 
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Difficulty
            </button>
          </div>
        </div>
      </div>

      {/* Content - Category or Difficulty View */}
      {sortMode === 'category' ? (
        /* Categories Accordion */
        <div className="space-y-3">
          {neetcode150Categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const solvedInCategory = category.problems.filter(p => solvedProblems.has(p.id)).length;
            const categoryProgress = Math.round((solvedInCategory / category.problems.length) * 100);

            return (
              <div 
                key={category.id} 
                className="bg-dark-900/50 border border-dark-800 rounded-xl overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-dark-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight className="w-5 h-5 text-dark-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{category.name}</h3>
                      <p className="text-sm text-dark-500">{category.problems.length} problems</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-dark-400">{solvedInCategory}/{category.problems.length}</span>
                    </div>
                    <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#7d72c7] to-[#9b8fd4] rounded-full transition-all duration-500"
                        style={{ width: `${categoryProgress}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Problems List */}
                {isExpanded && (
                  <div className="border-t border-dark-800/50">
                    {category.problems.map((problem, index) => {
                      const isSolved = solvedProblems.has(problem.id);
                      
                      return (
                        <div
                          key={problem.id}
                          onClick={() => setSelectedProblem({ ...problem, category: category.name })}
                          className={`px-6 py-3 flex items-center justify-between cursor-pointer transition-colors border-b border-dark-800/30 last:border-b-0 hover:bg-dark-800/40 ${
                            isSolved ? 'bg-green-500/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-mono text-dark-600 w-12">{problem.id}</span>
                            <button
                              onClick={(e) => toggleSolved(problem.id, e)}
                              className="p-1 rounded-full hover:bg-dark-800 transition-colors"
                            >
                              {isSolved ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-dark-600 hover:text-dark-400" />
                              )}
                            </button>
                            <span className={`font-medium ${isSolved ? 'text-dark-400 line-through' : 'text-white'}`}>
                              {problem.title}
                            </span>
                            {problem.isBlind && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-orange/20 text-brand-orange rounded border border-brand-orange/20">
                                BLIND 75
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Difficulty View */
        <DifficultyView 
          categories={neetcode150Categories}
          solvedProblems={solvedProblems}
          toggleSolved={toggleSolved}
          setSelectedProblem={setSelectedProblem}
          getDifficultyColor={getDifficultyColor}
        />
      )}

      {/* Problem Modal */}
      {selectedProblem && (
        <SheetProblemModal
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
          isSolved={solvedProblems.has(selectedProblem.id)}
        />
      )}
    </div>
  );
}

// Difficulty View Component
function DifficultyView({ categories, solvedProblems, toggleSolved, setSelectedProblem, getDifficultyColor }) {
  // Flatten all problems with their category info
  const allProblems = categories.flatMap(category => 
    category.problems.map(problem => ({
      ...problem,
      categoryName: category.name
    }))
  );

  // Group by difficulty
  const problemsByDifficulty = {
    Easy: allProblems.filter(p => p.difficulty === 'Easy'),
    Medium: allProblems.filter(p => p.difficulty === 'Medium'),
    Hard: allProblems.filter(p => p.difficulty === 'Hard')
  };

  const difficultyOrder = ['Easy', 'Medium', 'Hard'];
  const difficultyBgColors = {
    Easy: 'bg-green-500/10 border-green-500/20',
    Medium: 'bg-yellow-500/10 border-yellow-500/20',
    Hard: 'bg-red-500/10 border-red-500/20'
  };

  return (
    <div className="space-y-4">
      {difficultyOrder.map(difficulty => {
        const problems = problemsByDifficulty[difficulty];
        const solvedCount = problems.filter(p => solvedProblems.has(p.id)).length;
        const progress = Math.round((solvedCount / problems.length) * 100);

        return (
          <div 
            key={difficulty}
            className={`rounded-xl overflow-hidden border ${difficultyBgColors[difficulty]}`}
          >
            {/* Difficulty Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-dark-900/50">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getDifficultyColor(difficulty)}`}>
                  {difficulty}
                </span>
                <span className="text-dark-400 text-sm">{problems.length} problems</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-dark-400">{solvedCount}/{problems.length}</span>
                <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      difficulty === 'Easy' ? 'bg-green-500' : 
                      difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Problems List */}
            <div className="divide-y divide-dark-800/30">
              {problems.map((problem) => {
                const isSolved = solvedProblems.has(problem.id);
                
                return (
                  <div
                    key={problem.id}
                    onClick={() => setSelectedProblem({ ...problem, category: problem.categoryName })}
                    className={`px-6 py-3 flex items-center justify-between cursor-pointer transition-colors hover:bg-dark-800/40 ${
                      isSolved ? 'bg-green-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-dark-600 w-12">{problem.id}</span>
                      <button
                        onClick={(e) => toggleSolved(problem.id, e)}
                        className="p-1 rounded-full hover:bg-dark-800 transition-colors"
                      >
                        {isSolved ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-dark-600 hover:text-dark-400" />
                        )}
                      </button>
                      <span className={`font-medium ${isSolved ? 'text-dark-400 line-through' : 'text-white'}`}>
                        {problem.title}
                      </span>
                      {problem.isBlind && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-orange/20 text-brand-orange rounded border border-brand-orange/20">
                          BLIND 75
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-dark-500">{problem.categoryName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Neetcode150Page;

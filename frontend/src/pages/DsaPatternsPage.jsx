import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ChevronRight, 
  CheckCircle2,
  Circle,
  LayoutGrid,
  BarChart3,
  Target,
  Sparkles
} from 'lucide-react';
import { dsaPatternsCategories, getDsaPatternsStats } from '../data/dsaPatterns';
import SheetProblemModal from '../components/features/sheets/SheetProblemModal';

function DsaPatternsPage() {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [sortMode, setSortMode] = useState('category');
  const [solvedProblems, setSolvedProblems] = useState(() => {
    const saved = localStorage.getItem('dsa-patterns-solved');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const stats = getDsaPatternsStats();

  useEffect(() => {
    localStorage.setItem('dsa-patterns-solved', JSON.stringify([...solvedProblems]));
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
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/padho with pratyush.jpeg" alt="Padho With Pratyush" className="w-16 h-16 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Padho With Pratyush Pattern Sheet</h1>
            <p className="text-dark-400">Master 13 essential DSA patterns with curated problems</p>
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
            <div className="text-2xl font-black text-emerald-400">{stats.categories}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Patterns</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-brand-orange">{progress}%</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Progress</div>
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
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
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
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Patterns
            </button>
            <button
              onClick={() => setSortMode('difficulty')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                sortMode === 'difficulty' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
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
          {dsaPatternsCategories.map((category) => {
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/learn?pattern=${encodeURIComponent(category.name)}&auto=true`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      title="Study pattern deep-dive, templates & interview playbooks"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Study Pattern</span>
                    </button>
                    <div className="text-right">
                      <span className="text-sm font-bold text-dark-400">{solvedInCategory}/{category.problems.length}</span>
                    </div>
                    <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${categoryProgress}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Problems List */}
                {isExpanded && (
                  <div className="border-t border-dark-800/50">
                    {category.problems.map((problem) => {
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
          categories={dsaPatternsCategories}
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

export default DsaPatternsPage;

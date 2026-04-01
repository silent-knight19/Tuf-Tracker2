import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2,
  Circle,
  Target,
  Clock,
  LayoutGrid,
  BarChart3
} from 'lucide-react';
import { striversA2ZCategories, getStriversA2ZStats } from '../data/striversA2Z';
import SheetProblemModal from '../components/features/sheets/SheetProblemModal';

function StriversA2ZPage() {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState(new Set(['basics-programming']));
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [sortMode, setSortMode] = useState('category');
  const [solvedProblems, setSolvedProblems] = useState(() => {
    const saved = localStorage.getItem('strivers-a2z-solved');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const stats = getStriversA2ZStats();

  useEffect(() => {
    localStorage.setItem('strivers-a2z-solved', JSON.stringify([...solvedProblems]));
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

  const toggleSubcategory = (subcategoryId) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#312922] to-[#4a3d34] flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/striver.png" alt="Strivers" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Strivers A2Z DSA Sheet</h1>
            <p className="text-dark-400">Complete A2Z DSA course with 450+ problems from basics to advanced</p>
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
            <div className="text-2xl font-black text-[#5a4d44]">{stats.categories}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Steps</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-brand-orange">{progress}%</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-400">Overall Progress</span>
            <span className="text-white font-bold">{solvedProblems.size} / {stats.total} solved</span>
          </div>
          <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#312922] to-[#4a3d34] rounded-full transition-all duration-500"
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
                  ? 'bg-[#312922]/20 text-[#5a4d44] border border-[#312922]/30' 
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
                  ? 'bg-[#312922]/20 text-[#5a4d44] border border-[#312922]/30' 
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
        /* Steps / Categories */
        <div className="space-y-4">
        {striversA2ZCategories.map((category) => (
          <div key={category.id} className="bg-dark-900/30 border border-dark-800 rounded-xl overflow-hidden">
            {/* Step Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-dark-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-5 h-5 text-[#5a4d44]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-dark-500" />
                )}
                <h2 className="text-lg font-bold text-white">{category.name}</h2>
                <span className="text-dark-500 text-sm">
                  {category.subcategories?.reduce((acc, sub) => acc + sub.problems.length, 0)} problems
                </span>
              </div>
            </button>

            {/* Subcategories */}
            {expandedCategories.has(category.id) && category.subcategories && (
              <div className="border-t border-dark-800">
                {category.subcategories.map((sub) => (
                  <div key={sub.id} className="border-b border-dark-800/50 last:border-b-0">
                    {/* Subcategory Header */}
                    <button
                      onClick={() => toggleSubcategory(sub.id)}
                      className="w-full flex items-center justify-between p-3 pl-12 hover:bg-dark-800/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedSubcategories.has(sub.id) ? (
                          <ChevronDown className="w-4 h-4 text-dark-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-dark-500" />
                        )}
                        <h3 className="text-sm font-semibold text-dark-300">{sub.name}</h3>
                        <span className="text-dark-500 text-xs">{sub.problems.length} problems</span>
                      </div>
                    </button>

                    {/* Problems List */}
                    {expandedSubcategories.has(sub.id) && (
                      <div className="pl-16 pr-4 pb-3 space-y-2">
                        {sub.problems.map((problem) => (
                          <div
                            key={problem.id}
                            onClick={() => setSelectedProblem({ ...problem, category: category.name, subcategory: sub.name })}
                            className="flex items-center gap-3 p-3 bg-dark-950/30 border border-dark-800/50 rounded-lg hover:border-[#312922]/30 hover:bg-dark-800/20 transition-all cursor-pointer group"
                          >
                            {/* Solved Toggle */}
                            <button
                              onClick={(e) => toggleSolved(problem.id, e)}
                              className="shrink-0"
                            >
                              {solvedProblems.has(problem.id) ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-dark-600 group-hover:text-dark-400" />
                              )}
                            </button>

                            {/* Problem Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-dark-500 text-xs font-mono">#{problem.id}</span>
                                <span className="text-white font-medium truncate">{problem.title}</span>
                              </div>
                            </div>

                            {/* Difficulty Badge */}
                            <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>

                            {/* Links */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {problem.gfgUrl && (
                                <a
                                  href={problem.gfgUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-dark-400 hover:text-green-400 transition-colors"
                                >
                                  GFG
                                </a>
                              )}
                              {problem.leetCodeUrl && (
                                <a
                                  href={problem.leetCodeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-dark-400 hover:text-yellow-400 transition-colors"
                                >
                                  LeetCode
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      ) : (
        /* Difficulty View */
        <DifficultyView 
          categories={striversA2ZCategories}
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
          onToggleSolved={() => toggleSolved(selectedProblem.id)}
        />
      )}
    </div>
  );
}

// Difficulty View Component
function DifficultyView({ categories, solvedProblems, toggleSolved, setSelectedProblem, getDifficultyColor }) {
  // Flatten all problems with their category info
  const allProblems = categories.flatMap(category => 
    category.subcategories.flatMap(sub => 
      sub.problems.map(problem => ({
        ...problem,
        categoryName: category.name,
        subcategoryName: sub.name
      }))
    )
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
                    onClick={() => setSelectedProblem({ ...problem, category: problem.categoryName, subcategory: problem.subcategoryName })}
                    className={`px-6 py-3 flex items-center justify-between cursor-pointer transition-colors hover:bg-dark-800/40 ${
                      isSolved ? 'bg-green-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-dark-600 w-12">#{problem.id}</span>
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

export default StriversA2ZPage;
